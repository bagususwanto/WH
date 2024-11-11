import DetailOrder from "../models/DetailOrderModel";
import Order from "../models/OrderModel";
import Organization from "../models/OrganizationModel";
import User from "../models/UserModel";
import Warehouse from "../models/WarehouseModel";
import Group from "../models/GroupModel";

export const getOrderWarehouse = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, q } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = { isApproval: 1 };

    if (status) {
      whereCondition.status = status;
    }

    // Jika ada rentang tanggal, tambahkan kondisi untuk filter berdasarkan createdAt
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Jika startDate dan endDate sama, tambahkan waktu agar rentang mencakup seluruh hari
      end.setHours(23, 59, 59, 999); // Set end date ke akhir hari (23:59:59)

      whereCondition.createdAt = {
        [Op.between]: [start, end],
      };
    }

    // Jika ada query 'q', tambahkan kondisi untuk pencarian
    if (q) {
      whereCondition[Op.or] = [
        { transactionNumber: { [Op.like]: `%${q}%` } },
        { "$User.Organization.Group.groupName$": { [Op.like]: `%${q}%` } }, // Query terkait ke Material description
      ];
    }

    const response = await Order.findAll({
      whereCondition,
      include: [
        {
          model: User,
          where: { flag: 1 },
          include: [
            {
              model: Organization,
              where: { flag: 1 },
              include: [
                {
                  model: Group,
                  where: { flag: 1 },
                },
              ],
            },
            {
              model: Warehouse,
              where: { flag: 1, id: req.user.warehouseId },
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDetailOrderAcc = async (req, res) => {
  try {
    const response = await DetailOrder.findAll({
      where: { orderId: req.params.orderId },
      include: [
        {
          model: Order,
          where: { isApproval: 1, status: "waiting approval" },
          include: [
            {
              model: User,
              where: { flag: 1 },
              include: [
                {
                  model: Warehouse,
                  where: { flag: 1, id: req.user.warehouseId },
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const isAuthorized = async (orderId, userId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: User,
          where: { flag: 1 },
          include: [
            {
              model: Warehouse,
              where: { flag: 1 },
            },
          ],
        },
      ],
    });

    const userAcc = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!order.User.Warehouse.id) {
      return false;
    }

    if (!userAcc.warehouseId) {
      return false;
    }

    // cek authorize accepted
    if (order.User.Warehouse.id !== userAcc.warehouseId) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const accOrder = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;
    const orderDetails = req.body.orderDetails; // Ambil detail order dari req.body
    const role = req.user.roleName;

    const orders = await DetailOrder.findAll({
      where: { orderId: orderId },
    });

    if (role) {
      if (role !== "warehouse staff") {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    // Cek apakah user berwenang untuk approve
    if (!(await isAuthorized(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    let typeLog = "approve warehouse";
    let quantityBefore;
    let quantityAfter;
    const status = "approved warehouse";

    // Update quantity jika ada perubahan
    for (let order of orders) {
      const updatedOrder = orderDetails.find((detail) => detail.id === order.id);

      if (updatedOrder && updatedOrder.quantity !== order.quantity) {
        await DetailOrder.update({ quantity: updatedOrder.quantity }, { where: { id: order.id }, transaction });
        typeLog = "adjust warehouse";
        quantityBefore = order.quantity;
        quantityAfter = updatedOrder.quantity;
      }
    }

    // Create history approval di tabel Approval
    await Approval.create(
      {
        orderId: orderId,
        userId: userId,
        status: status,
      },
      { transaction }
    );

    await LogApproval.bulkCreate(
      orders.map((detailOrder) => ({
        typeLog: typeLog,
        userId: userId,
        detailOrderId: detailOrder.id,
        quantityBefore: quantityBefore ? quantityBefore : null,
        quantityAfter: quantityAfter ? quantityAfter : null,
      })),
      { transaction }
    );

    // create order history
    await postOrderHistory(status, userId, orderId, { transaction });

    // update status order
    const order = await Order.update({ status: "on process" }, { where: { id: orderId }, transaction });

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Approval success",
      status: "Approved",
      "Transaction Number": order.transactionNumber,
    });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectOrderWarehouse = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const detailOrderId = req.params.detailOrderId;
    const userId = req.user.userId;
    const role = req.user.roleName;

    const order = await DetailOrder.findOne({
      where: { id: detailOrderId },
      include: [
        {
          model: Order,
        },
      ],
    });

    // Cek apakah order ditemukan
    if (!order) {
      await transaction.rollback(); // Batalkan transaksi jika order tidak ditemukan
      return res.status(404).json({ message: "Order not found" });
    }

    const orderId = order.orderId;

    if (role) {
      if (role !== "warehouse staff") {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    // Cek apakah user berwenang untuk approve
    if (!(await isAuthorized(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Update isReject di tabel DetailOrder
    await DetailOrder.update({ isReject: 1 }, { where: { id: detailOrderId }, transaction });

    // Create history reject di tabel LogApproval
    await LogApproval.create(
      {
        typeLog: "reject warehouse",
        userId: userId,
        detailOrderId: detailOrderId,
      },
      { transaction }
    );

    const status = "rejected warehouse";

    // Create history order
    await postOrderHistory(status, userId, orderId, { transaction });

    await transaction.commit(); // Commit transaksi setelah operasi berhasil

    res.status(200).json({
      message: "Reject success",
      status: "Rejected",
      "request number": order.Order.requestNumber,
    });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
