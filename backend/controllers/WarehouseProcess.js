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
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";
import Redpost from "../models/RedpostModel.js";
import UserWarehouse from "../models/UserWarehouseModel.js";

export const getOrderWarehouse = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      isReject,
      q,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereCondition = { isApproval: 1 };
    let whereCondition2 = { isDelete: 0, isReject: 0 };

    if (status) {
      whereCondition.status = status;
    }

    // Jika ada rentang tanggal, tambahkan kondisi untuk filter berdasarkan transactionDate
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set end date ke akhir hari (23:59:59)

      whereCondition.transactionDate = {
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

    // Hitung total entri sesuai kondisi pencarian
    const totalRecords = await Order.count({
      where: whereCondition,
      distinct: true,
      col: "id",
      include: [
        {
          model: DetailOrder,
          attributes: ["id"],
          where: whereCondition2,
          required: true,
          include: [
            {
              model: Inventory,
              attributes: ["id"],
              required: true,
              include: [
                {
                  model: AddressRack,
                  attributes: ["id"],
                  where: { flag: 1 },
                  required: true,
                  include: [
                    {
                      model: Storage,
                      attributes: ["id"],
                      required: true,
                      where: { flag: 1 },
                      include: [
                        {
                          model: Plant,
                          required: true,
                          attributes: ["id"],
                          where: { flag: 1 },
                          include: [
                            {
                              model: Warehouse,
                              required: true,
                              attributes: ["id"],
                              where: { flag: 1, id: warehouseId },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: User,
          where: { flag: 1 },
          attributes: [
            "id",
            "username",
            "name",
            "position",
            "img",
            "noHandphone",
            "email",
            "createdAt",
            "updatedAt",
          ],
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
            // {
            //   model: Warehouse,
            //   as: "alternateWarehouse",
            //   required: true,
            //   where: { id: warehouseId },
            // },
          ],
        },
      ],
    });

    // Hitung total halaman
    const totalPages = Math.ceil(totalRecords / limit);

    // Ambil data Order
    const response = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: DetailOrder,
          where: whereCondition2,
          required: true,
          separate: true,
          include: [
            {
              model: Inventory,
              required: true,
              attributes: ["id", "addressId", "materialId"],
              include: [
                {
                  model: AddressRack,
                  required: true,
                  attributes: ["id", "addressRackName"],
                  where: { flag: 1 },
                  include: [
                    {
                      model: Storage,
                      required: true,
                      attributes: ["id", "storageName"],
                      where: { flag: 1 },
                      include: [
                        {
                          model: Plant,
                          required: true,
                          attributes: ["id", "plantName"],
                          where: { flag: 1 },
                          include: [
                            {
                              model: Warehouse,
                              required: true,
                              attributes: ["id", "warehouseName"],
                              where: { flag: 1, id: warehouseId },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Material,
                  required: true,
                  attributes: [
                    "id",
                    "materialNo",
                    "description",
                    "uom",
                    "price",
                    "img",
                    "minOrder",
                  ],
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
        {
          model: User,
          where: { flag: 1 },
          attributes: [
            "id",
            "username",
            "name",
            "position",
            "img",
            "noHandphone",
            "email",
            "createdAt",
            "updatedAt",
          ],
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
            // {
            //   model: Warehouse,
            //   as: "alternateWarehouse",
            //   required: true,
            //   where: { id: warehouseId },
            // },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      subQuery: false,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (response.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({
      totalPages,
      data: response,
    });
  } catch (error) {
    console.log(error);
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
              attributes: [
                "id",
                "username",
                "name",
                "position",
                "img",
                "noHandphone",
                "email",
                "createdAt",
                "updatedAt",
              ],
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
      attributes: ["userId"],
    });

    if (!order) return false;

    const userAcc = await User.findOne({
      where: { id: userId, flag: 1 },
      attributes: ["warehouseId"],
    });

    if (!userAcc || !userAcc.warehouseId) return false;

    const userOrderWarehouses = await UserWarehouse.findAll({
      where: { userId: order.userId, flag: 1 },
      attributes: ["warehouseId"],
    });

    const warehouseIds = userOrderWarehouses.map((uw) => uw.warehouseId);

    // Cek apakah userAcc.warehouseId ada dalam list warehouse pemilik order
    if (warehouseIds.includes(userAcc.warehouseId)) {
      return true;
    }

    return false;
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
    // const updateQuantity = req.body.updateQuantity;

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

    // const orders = await DetailOrder.findAll({
    //   where: { orderId: orderId },
    //   include: [
    //     {
    //       model: Inventory,
    //       include: [
    //         {
    //           model: Material,
    //           where: { flag: 1 },
    //           attributes: [
    //             "id",
    //             "price",
    //             "materialNo",
    //             "description",
    //             "uom",
    //             "minOrder",
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // });

    if (
      orderStatus.status === "waiting approval" ||
      orderStatus.isApproval !== 1
    ) {
      await transaction.rollback(); // Batalkan transaksi jika belum disetujui
      return res.status(401).json({ message: "Order must be approved" });
    }

    if (orderStatus.status !== "waiting confirmation") {
      await transaction.rollback(); // Batalkan transaksi jika status bukan "approved"
      return res.status(401).json({ message: "Order has been processed" });
    }

    if (role && role !== "warehouse staff") {
      await transaction.rollback(); // Batalkan transaksi jika bukan warehouse staff
      return res.status(401).json({
        message: "Unauthorized, only warehouse staff can process the order",
      });
    }

    // let typeLog = "accepted warehouse";
    const status = "accepted warehouse";
    // const updatedOrders = [];

    // // Lakukan update quantity berdasarkan detailOrderId
    // if (updateQuantity && updateQuantity.length > 0) {
    //   for (const item of updateQuantity) {
    //     const order = orders.find((o) => o.id === item.detailOrderId);
    //     if (order) {
    //       const quantityBefore = order.quantity;
    //       const quantityAfter = item.quantity;
    //       const price = order.Inventory.Material.price;

    //       // Validasi jika quantity kurang dari min order
    //       if (quantityAfter < order.Inventory.Material.minOrder) {
    //         await transaction.rollback();
    //         return res.status(400).json({
    //           message: `Quantity the material ${order.Inventory.Material.materialNo}
    //            must be at least ${order.Inventory.Material.minOrder} ${order.Inventory.Material.uom}`,
    //         });
    //       }

    //       // Update quantity dan price di DetailOrder
    //       await DetailOrder.update(
    //         { quantity: quantityAfter, price: quantityAfter * price },
    //         { where: { id: item.detailOrderId }, transaction }
    //       );

    //       // Simpan perubahan ke array updatedOrders untuk perhitungan totalPrice
    //       updatedOrders.push({
    //         quantity: quantityAfter,
    //         price: quantityAfter * price,
    //       });

    //       // Log perubahan ke tabel LogApproval
    //       await LogApproval.create(
    //         {
    //           typeLog: "adjust",
    //           userId: userId,
    //           detailOrderId: item.detailOrderId,
    //           quantityBefore: quantityBefore,
    //           quantityAfter: quantityAfter,
    //         },
    //         { transaction }
    //       );
    //     }
    //   }
    // }

    // // Tambahkan detail order yang tidak diubah ke updatedOrders untuk menghitung totalPrice
    // for (const order of orders) {
    //   if (!updateQuantity.some((item) => item.detailOrderId === order.id)) {
    //     updatedOrders.push({
    //       quantity: order.quantity,
    //       price: order.quantity * order.Inventory.Material.price,
    //     });
    //   }
    // }

    if (!isAuthorized(orderId, userId)) {
      await transaction.rollback(); // Batalkan transaksi jika warehouse staff tidak memiliki akses
      return res.status(401).json({
        message: "Unauthorized, does not have access to this order",
      });
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

    // await LogApproval.bulkCreate(
    //   orders.map((detailOrder) => ({
    //     typeLog: typeLog,
    //     userId: userId,
    //     detailOrderId: detailOrder.id,
    //     quantityBefore: detailOrder.quantity,
    //     quantityAfter: detailOrder.quantity,
    //   })),
    //   { transaction }
    // );

    // Buat riwayat order
    await postOrderHistory(status, userId, orderId, null, { transaction });

    // // Hitung totalPrice dari updatedOrders
    // const totalPrice = updatedOrders.reduce((total, detailOrder) => {
    //   return total + detailOrder.price;
    // }, 0);

    // Update status order menjadi "on process" dan simpan totalPrice
    const updatedOrder = await Order.update(
      {
        status: "on process",
        // totalPrice: totalPrice,
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

    const respOrder = await Order.findOne({
      where: { id: orderId },
      attributes: ["id", "deliveryMethod", "status", "isApproval", "userId"],
      include: [
        {
          model: DetailOrder,
          include: [
            {
              model: Inventory,
              include: [
                {
                  model: Material,
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
      ],
    });

    if (respOrder.status !== "on process" || respOrder.isApproval !== 1) {
      await transaction.rollback(); // Batalkan transaksi jika order tidak ditemukan
      return res
        .status(401)
        .json({ message: "Unauthorized, the order cannot be processed" });
    }

    let status;

    if (respOrder.deliveryMethod == "pickup") {
      status = "ready to pickup";
    } else {
      status = "ready to deliver";
    }

    if (role) {
      if (role !== "warehouse member" && role !== "warehouse staff") {
        return res.status(401).json({
          message:
            "Unauthorized, you are not warehouse member or warehouse staff",
        });
      }
    }

    if (!isAuthorized(orderId, userId)) {
      await transaction.rollback(); // Batalkan transaksi jika warehouse staff tidak memiliki akses
      return res.status(401).json({
        message: "Unauthorized, does not have access to this order",
      });
    }
    
    const updatedOrders = [];

    // Lakukan update quantity berdasarkan detailOrderId
    if (updateQuantity && updateQuantity.length > 0) {
      for (const item of updateQuantity) {
        const order = respOrder.Detail_Orders.find(
          (o) => o.id === item.detailOrderId
        );

        if (order) {
          const quantityBefore = order.quantity;
          const quantityAfter = item.quantity;
          const price = order.Inventory.Material.price;

          // Cek apakah quantity berbeda
          if (quantityBefore !== quantityAfter) {
            // Validasi jika quantity kurang dari min order
            if (
              quantityAfter < order.Inventory.Material.minOrder ||
              quantityAfter % order.Inventory.Material.minOrder !== 0
            ) {
              await transaction.rollback();
              return res.status(400).json({
                message: `Item ${order.Inventory.Material.materialNo},
               quantity must match the minimum order quantity of ${order.Inventory.Material.minOrder} ${order.Inventory.Material.uom}`,
              });
            }

            // Update quantity dan price di DetailOrder
            await DetailOrder.update(
              { quantity: quantityAfter, price: quantityAfter * price },
              { where: { id: item.detailOrderId }, transaction }
            );

            // Create history order
            await postOrderHistory(
              `Order quantity for item ${order.Inventory.Material.description} revised by Warehouse, 
            From ${quantityBefore} ${order.Inventory.Material.uom} to ${quantityAfter} ${order.Inventory.Material.uom}`,
              userId,
              orderId,
              "Out of Stock",
              { transaction }
            );

            // Create Notification revised order
            const notification = {
              title: "Order Revised",
              description: `Order quantity for item ${order.Inventory.Material.description} revised by Warehouse`,
              category: "approval",
            };
            await createNotification(
              [respOrder.userId],
              notification,
              transaction
            );

            // Create data redpost
            await Redpost.create(
              {
                detailOrderId: item.detailOrderId,
                userId: userId,
                quantityRequest: quantityBefore,
                quantityReturn: quantityAfter,
                quantity: quantityBefore - quantityAfter,
                date: new Date(new Date().getTime() - 8 * 60 * 60 * 1000), // Tanggal sekarang dikurangi 8 jam
              },
              { transaction }
            );

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
      for (const order of respOrder.Detail_Orders) {
        if (!updateQuantity.some((item) => item.detailOrderId === order.id)) {
          updatedOrders.push({
            quantity: order.quantity,
            price: order.quantity * order.Inventory.Material.price,
          });
        }
      }
    }

    // Hitung totalPrice dari updatedOrders
    const totalPrice = updatedOrders.reduce((total, detailOrder) => {
      return total + detailOrder.price;
    }, 0);

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
    await postOrderHistory(status, userId, orderId, null, { transaction });

    // update status order
    const order = await Order.update(
      { status: status, totalPrice: totalPrice },
      { where: { id: orderId }, transaction }
    );

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
      attributes: ["id", "status", "isApproval", "transactionNumber", "userId"],
      include: [
        {
          model: DetailOrder,
          attributes: ["id", "quantity"],
        },
      ],
    });

    const allowedStatuses = ["ready to deliver", "ready to pickup"];

    if (!allowedStatuses.includes(respOrder.status)) {
      await transaction.rollback(); // Batalkan transaksi jika status order tidak sesuai
      return res.status(401).json({
        message:
          "Order cannot be processed, order status is not ready to deliver or ready to pickup",
      });
    }

    if (role) {
      if (role !== "warehouse member" && role !== "warehouse staff") {
        return res.status(401).json({
          message:
            "Unauthorized, you are not warehouse member or warehouse staff",
        });
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
    await postOrderHistory("Order Completed", userId, orderId, null, {
      transaction,
    });

    // update status order
    await Order.update(
      { status: "completed", deliveredAt: new Date() },
      { where: { id: orderId }, transaction }
    );

    // create notification
    const notification = {
      title: "Order Completed",
      description: `Order with transaction number ${respOrder.transactionNumber} has been completed`,
      category: "order",
    };
    await createNotification([respOrder.userId], notification, { transaction });

    // Commit transaksi setelah operasi berhasil
    await transaction.commit();

    // Respon success
    return res.status(200).json({
      message: "Order completed",
      status: "Completed",
      "Transaction Number": respOrder.transactionNumber,
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
    const remarks = req.body.remarks;

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
      if (role !== "warehouse staff" && role !== "warehouse member") {
        return res.status(401).json({
          message: "Unauthorized, only warehouse staff can reject the order",
        });
      }
    }

    // Update isReject di tabel DetailOrder dengan remarks
    await DetailOrder.update(
      { isReject: 1, remarks },
      { where: { id: detailOrderId }, transaction }
    );

    // Create history reject di tabel LogApproval
    await LogApproval.create(
      {
        typeLog: "reject warehouse",
        userId: userId,
        detailOrderId: detailOrderId,
      },
      { transaction }
    );

    const status = `order revised by warehouse for item: ${order.Inventory.Material.description}`;

    // Create history order
    await postOrderHistory(status, userId, orderId, remarks, { transaction });

    // Create notification
    const notification = {
      title: "Order Revised",
      description: `Order revised by warehouse for item: ${order.Inventory.Material.description}, remarks: ${remarks}`,
      category: "approval",
    };

    await createNotification([order.Order.userId], notification, {
      transaction,
    });

    // Jika remarks mengandung kata stock not available
    if (remarks.toLowerCase().includes("item is not available")) {
      // Create data redpost
      await Redpost.create(
        {
          detailOrderId: detailOrderId,
          userId: userId,
          quantityRequest: order.quantity,
          quantityReturn: 0,
          quantity: order.quantity,
          date: new Date(new Date().getTime() - 8 * 60 * 60 * 1000), // Tanggal sekarang dikurangi 8 jam
        },
        { transaction }
      );
    }

    await transaction.commit(); // Commit transaksi setelah operasi berhasil

    res.status(200).json({
      message: "Reject success",
      status: "Rejected",
      "request number": order.Order.requestNumber,
      "material description": order.Inventory.Material.description,
    });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
