import DetailOrder from "../models/DetailOrderModel";
import Order from "../models/OrderModel";
import Organization from "../models/OrganizationModel";
import User from "../models/UserModel";
import Warehouse from "../models/WarehouseModel";
import Inventory from "../models/InventoryModel";
import Material from "../models/MaterialModel";
import AddressRack from "../models/AddressRackModel";
import { Op } from "sequelize";
import { postOrderHistory } from "./OrderHistory";
import Line from "../models/LineModel";
import Section from "../models/SectionModel";

export const getOrderWarehouse = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const { page = 1, limit = 10, status, startDate, endDate, isReject, q } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = { isApproval: 1 };
    let whereCondition2 = { isDelete: 0, isReject: 0 };

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
        { "$User.Organization.Line.lineName$": { [Op.like]: `%${q}%` } },
        { "$User.Organization.Section.sectionName$": { [Op.like]: `%${q}%` } },
      ];
    }

    if (isReject) {
      whereCondition2.isReject = isReject;
    }

    const response = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: DetailOrder,
          where: whereCondition2,
          include: [
            {
              model: Inventory,
              include: [
                {
                  model: Material,
                  where: { flag: 1 },
                },
                {
                  model: AddressRack,
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
        {
          model: User,
          where: { flag: 1 },
          attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
          include: [
            {
              model: Organization,
              where: { flag: 1 },
              include: [
                {
                  model: Line,
                  where: { flag: 1 },
                },
                {
                  model: Section,
                  where: { flag: 1 },
                },
              ],
            },
            {
              model: Warehouse,
              where: { flag: 1, id: warehouseId },
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (response.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDetailOrderWarehouse = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const response = await DetailOrder.findAll({
      where: { orderId: req.params.orderId, isReject: 0, isDelete: 0 },
      include: [
        {
          model: Inventory,
          include: [
            {
              model: Material,
              where: { flag: 1 },
            },
            {
              model: AddressRack,
              where: { flag: 1 },
            },
          ],
        },
        {
          model: Order,
          where: { isApproval: 1 },
          include: [
            {
              model: User,
              where: { flag: 1 },
              attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
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
                  where: { flag: 1, id: warehouseId },
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

export const processOrder = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;
    const role = req.user.roleName;
    const updateQuantity = req.body.updateQuantity;

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

    // Lakukan update quantity berdasarkan detailOrderId
    if (updateQuantity && updateQuantity.length > 0) {
      for (const item of updateQuantity) {
        const order = orders.find((o) => o.id === item.detailOrderId);
        if (order) {
          quantityBefore = order.quantity;
          quantityAfter = item.quantity;

          // Update quantity di DetailOrder
          await DetailOrder.update({ quantity: quantityAfter }, { where: { id: item.detailOrderId }, transaction });

          // Log perubahan ke tabel LogApproval
          await LogApproval.create(
            {
              typeLog: "adjust",
              userId: userId,
              detailOrderId: item.detailOrderId,
              quantityBefore: quantityBefore,
              quantityAfter: quantityAfter,
            },
            { transaction }
          );
        }
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

export const shopingOrder = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;
    const role = req.user.roleName;

    const respOrder = await Order.findOne({
      where: { id: orderId },
      attributes: ["id", "deliveryMethod"],
      include: [
        {
          model: DetailOrder,
        },
      ],
    });

    let status;

    if (respOrder.deliveryMethod == "pickup") {
      status = "ready to pickup";
    } else {
      status = "ready to deliver";
    }

    if (role) {
      if (role !== "warehouse member") {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    // Cek apakah user berwenang untuk approve
    if (!(await isAuthorized(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create Log entry
    await LogEntry.bulkCreate(
      respOrder.Detail_Orders.map((detailOrder) => ({
        userId: userId,
        detailOrderId: detailOrder.id,
        typeLogEntry: "shoping order",
        quantity: detailOrder.quantity,
      })),
      { transaction }
    );

    // update status order
    const order = await Order.update({ status: status }, { where: { id: orderId }, transaction });

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Shoping success",
      status: "Shoping",
      "Transaction Number": order.transactionNumber,
    });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const completeOrder = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;
    const role = req.user.roleName;

    const respOrder = await Order.findOne({
      where: { id: orderId },
      attributes: ["id"],
      include: [
        {
          model: DetailOrder,
          attributes: ["id", "quantity"],
        },
      ],
    });

    if (role) {
      if (role !== "warehouse member") {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }

    // Cek apakah user berwenang untuk approve
    if (!(await isAuthorized(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create Log entry
    await LogEntry.bulkCreate(
      respOrder.Detail_Orders.map((detailOrder) => ({
        userId: userId,
        detailOrderId: detailOrder.id,
        typeLogEntry: "complete order",
        quantity: detailOrder.quantity,
      })),
      { transaction }
    );

    // update status order
    const order = await Order.update({ status: "completed" }, { where: { id: orderId }, transaction });

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Order completed",
      status: "Order Complete",
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
