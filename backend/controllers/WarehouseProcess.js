import DetailOrder from "../models/DetailOrderModel.js";
import Order from "../models/OrderModel.js";
import Organization from "../models/OrganizationModel.js";
import User from "../models/UserModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Line from "../models/LineModel.js";
import Section from "../models/SectionModel.js";
import Approval from "../models/ApprovalModel.js";
import LogApproval from "../models/LogApprovalModel.js";
import LogEntry from "../models/LogEntryModel.js";
import { Op } from "sequelize";
import { postOrderHistory } from "./OrderHistory.js";
import db from "../utils/Database.js";
import { createNotification } from "./Notification.js";

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

    if (isReject == 1) {
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
              attributes: ["id", "addressId", "materialId"],
              include: [
                {
                  model: AddressRack,
                  required: false,
                  attributes: ["id", "addressRackName"],
                  where: { flag: 1 },
                },
                {
                  model: Material,
                  required: false,
                  attributes: ["id", "materialNo", "description", "uom", "price"],
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
                  required: false,
                  where: { flag: 1 },
                },
                {
                  model: Section,
                  required: false,
                  where: { flag: 1 },
                },
              ],
            },
            {
              model: Warehouse,
              as: "alternateWarehouse",
              required: true,
              where: { id: warehouseId },
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
        },
      ],
    });

    const userAcc = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!order) {
      return false;
    }

    if (!userAcc.warehouseId) {
      return false;
    }

    // cek authorize accepted
    if (order.User.anotherWarehouseId !== userAcc.warehouseId) {
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

    // Example data updateQuantity
    // {
    //   "updateQuantity": [
    //     {
    //       "detailOrderId": 1,
    //       "quantity": 50
    //     },
    //     {
    //       "detailOrderId": 2,
    //       "quantity": 30
    //     }
    //   ]
    // }

    const orderStatus = await Order.findOne({
      where: { id: orderId },
      attributes: ["status", "isApproval"],
    });

    const orders = await DetailOrder.findAll({
      where: { orderId: orderId },
      include: [
        {
          model: Inventory,
          include: [
            {
              model: Material,
              where: { flag: 1 },
              attributes: ["id", "price"],
            },
          ],
        },
      ],
    });

    if (orderStatus.status === "waiting confirmation" || orderStatus.isApproval !== 1) {
      await transaction.rollback(); // Batalkan transaksi jika belum disetujui
      return res.status(401).json({ message: "Unauthorized, the order must be approved" });
    }

    if (orderStatus.status !== "waiting confirmation") {
      await transaction.rollback(); // Batalkan transaksi jika status bukan "approved"
      return res.status(401).json({ message: "Unauthorized, the order has been processed" });
    }


    if (role && role !== "warehouse staff") {
      await transaction.rollback(); // Batalkan transaksi jika bukan warehouse staff
      return res.status(401).json({ message: "Unauthorized, only warehouse staff can process the order" });
    }

    let typeLog = "accepted warehouse";
    const status = "accepted warehouse";
    const updatedOrders = [];

    // Lakukan update quantity berdasarkan detailOrderId
    if (updateQuantity && updateQuantity.length > 0) {
      for (const item of updateQuantity) {
        const order = orders.find((o) => o.id === item.detailOrderId);
        if (order) {
          const quantityBefore = order.quantity;
          const quantityAfter = item.quantity;
          const price = order.Inventory.Material.price;

          // Update quantity dan price di DetailOrder
          await DetailOrder.update({ quantity: quantityAfter, price: quantityAfter * price }, { where: { id: item.detailOrderId }, transaction });

          // Simpan perubahan ke array updatedOrders untuk perhitungan totalPrice
          updatedOrders.push({
            quantity: quantityAfter,
            price: quantityAfter * price,
          });

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

    // Tambahkan detail order yang tidak diubah ke updatedOrders untuk menghitung totalPrice
    for (const order of orders) {
      if (!updateQuantity.some((item) => item.detailOrderId === order.id)) {
        updatedOrders.push({
          quantity: order.quantity,
          price: order.quantity * order.Inventory.Material.price,
        });
      }
    }

    // Buat riwayat approval di tabel Approval
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
        quantityBefore: detailOrder.quantity,
        quantityAfter: detailOrder.quantity,
      })),
      { transaction }
    );

    // Buat riwayat order
    await postOrderHistory(status, userId, orderId, { transaction });

    // Hitung totalPrice dari updatedOrders
    const totalPrice = updatedOrders.reduce((total, detailOrder) => {
      return total + detailOrder.price;
    }, 0);

    // Update status order menjadi "on process" dan simpan totalPrice
    const updatedOrder = await Order.update(
      {
        status: "on process",
        totalPrice: totalPrice,
      },
      { where: { id: orderId }, transaction }
    );

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Process success",
      status: "Processed",
      "Transaction Number": updatedOrder.transactionNumber,
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
      attributes: ["id", "deliveryMethod", "status", "isApproval"],
      include: [
        {
          model: DetailOrder,
        },
      ],
    });

    if (respOrder.status !== "on process" || respOrder.isApproval !== 1) {
      await transaction.rollback(); // Batalkan transaksi jika order tidak ditemukan
      return res.status(401).json({ message: "Unauthorized, the order cannot be processed" });
    }

    let status;

    if (respOrder.deliveryMethod == "pickup") {
      status = "ready to pickup";
    } else {
      status = "ready to deliver";
    }

    if (role) {
      if (role !== "warehouse member" && role !== "warehouse staff") {
        return res.status(401).json({ message: "Unauthorized, you are not warehouse member or warehouse staff" });
      }
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

    // Create order history
    await postOrderHistory(status, userId, orderId, { transaction });

    // update status order
    const order = await Order.update({ status: status }, { where: { id: orderId }, transaction });

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Shoping success",
      status: "Shoped",
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
      attributes: ["id", "status", "isApproval"],
      include: [
        {
          model: DetailOrder,
          attributes: ["id", "quantity"],
        },
      ],
    });

    if (respOrder.status !== "ready to deliver" && respOrder.status !== "ready to pickup" && respOrder.isApproval !== 1) {
      await transaction.rollback(); // Batalkan transaksi jika order tidak ditemukan
      return res.status(401).json({ message: "Unauthorized, the order cannot be processed" });
    }

    if (role) {
      if (role !== "warehouse member" && role !== "warehouse staff") {
        return res.status(401).json({ message: "Unauthorized, you are not warehouse member or warehouse staff" });
      }
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

    // Create order history
    await postOrderHistory("your items received", userId, orderId, { transaction });

    // update status order
    const order = await Order.update({ status: "completed" }, { where: { id: orderId }, transaction });

    const userOrder = await Order.findOne({ where: { id: orderId }, attributes: ["userId"] });
    const notification = {
      title: "Order Completed",
      description: `Order with transaction number ${order.transactionNumber} has been completed`,
      category: "order",
    };
    await createNotification(userOrder, notification, transaction);

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Order completed",
      status: "Completed",
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
          model: Inventory,
          attributes: ["id"],
          include: [
            {
              model: Material,
              attributes: ["description"],
              where: { flag: 1 },
              required: false,
            },
          ],
        },
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
        return res.status(401).json({ message: "Unauthorized, only warehouse staff can reject the order" });
      }
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

    const status = `rejected warehouse for items: ${order.Material.description}`;

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
