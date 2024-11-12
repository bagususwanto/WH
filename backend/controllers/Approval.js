import db from "../utils/Database.js";
import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import Organization from "../models/OrganizationModel.js";
import Role from "../models/RoleModel.js";
import Approval from "../models/ApprovalModel.js";
import LogApproval from "../models/LogApprovalModel.js";
import DetailOrder from "../models/DetailOrderModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import { generateOrderNumber } from "./Order.js";
import { postOrderHistory } from "./OrderHistory.js";
import Warehouse from "../models/WarehouseModel.js";
import { Op } from "sequelize";
import { createNotification } from "./Notification.js";
import AddressRack from "../models/AddressRackModel.js";
import Line from "../models/LineModel.js";
import Section from "../models/SectionModel.js";

// Helper function untuk mengambil userIdApproval
export const getUserIdApproval = async (condition) => {
  const users = await User.findAll({ where: { ...condition, flag: 1 } });

  // Extract only the 'id' of each user in the array
  const userIds = users.map((user) => user.id);
  return userIds.length > 0 ? userIds : null;
};

// Helper function untuk userIdWarehouse
export const getUserIdWarehouse = async (condition) => {
  const users = await User.findAll({ where: { ...condition, flag: 1 } });
  return users.map((user) => user.id); // Extracts `id` from each user object in the array
};

const getOrganizationCondition = (user, role) => {
  switch (role) {
    case "line head":
      return { organizationField: "lineId", organizationId: user.lineId };
    case "section head":
      return { organizationField: "sectionId", organizationId: user.sectionId };
    case "department head":
      return { organizationField: "departmentId", organizationId: user.departmentId };
    default:
      return null;
  }
};

const findRoleAndOrders = async (roleName, organizationField, organizationId, warehouseId, options) => {
  const role = await Role.findOne({ where: { roleName, flag: 1 } });

  const { q, startDate, endDate, limit, offset, approved } = options;

  // Buat kondisi where yang dinamis untuk Order
  let whereCondition = { isApproval: 0, currentRoleApprovalId: role.id };
  let whereCondition2;

  if (approved) {
    whereCondition2 = { status: `approved ${approved}` };
    whereCondition = {};
  }

  // Jika ada rentang tanggal, tambahkan kondisi filter berdasarkan createdAt
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set end date ke akhir hari

    whereCondition.createdAt = {
      [Op.between]: [start, end],
    };
  }

  // Jika ada query 'q', tambahkan kondisi pencarian berdasarkan beberapa kolom
  if (q) {
    whereCondition[Op.or] = [{ transactionNumber: { [Op.like]: `%${q}%` } }, { requestNumber: { [Op.like]: `%${q}%` } }];
  }

  // Tentukan array `include` secara dinamis
  const includes = [
    {
      model: DetailOrder,
      where: { isReject: 0, isDelete: 0 },
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
      required: true,
      attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
      include: [
        {
          model: Organization,
          where: { [organizationField]: organizationId },
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
  ];

  // Tambahkan `Approval` ke array `include` jika `approved` ada nilainya
  if (approved) {
    includes.push({
      model: Approval,
      required: true,
      attributes: ["id", "status"],
      where: whereCondition2,
    });
  }

  return await Order.findAll({
    where: whereCondition,
    include: includes,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  });
};

export const getOrderApproval = async (req, res) => {
  const role = req.user.roleName;
  const condition = getOrganizationCondition(req.user, role);
  const warehouseId = req.params.warehouseId;

  const { page = 1, limit = 10, q, startDate, endDate } = req.query;
  const offset = (page - 1) * limit;

  if (!condition) return res.status(400).json({ message: "Invalid role" });

  try {
    const orders = await findRoleAndOrders(role, condition.organizationField, condition.organizationId, warehouseId, {
      q,
      startDate,
      endDate,
      limit,
      offset,
      approved: req.query.approved,
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const findRoleAndDetailOrders = async (roleName, organizationField, organizationId, orderId, warehouseId) => {
//   const role = await Role.findOne({ where: { roleName, flag: 1 } });
//   return;
// };

export const getDetailOrderApproval = async (req, res) => {
  const warehouseId = req.params.warehouseId;
  const orderId = req.params.orderId;

  try {
    const orders = await Order.findAll({
      where: { id: orderId },
      include: [
        {
          model: DetailOrder,
          where: { isReject: 0, isDelete: 0 },
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
        {
          model: User,
          required: true,
          attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
          include: [
            {
              model: Warehouse,
              as: "alternateWarehouse", // Menggunakan alias di sini
              required: true,
              where: { id: warehouseId },
            },
          ],
        },
      ],
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No approval order found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const isAuthorizedApproval = async (orderId, userId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: User,
          where: { flag: 1 },
          include: [
            {
              model: Role,
              where: { flag: 1 },
            },
            {
              model: Organization,
              where: { flag: 1 },
            },
          ],
        },
      ],
    });

    const userApproval = await User.findOne({
      where: { id: userId, flag: 1 },
      include: [
        {
          model: Organization,
          where: { flag: 1 },
        },
      ],
    });

    // cek authorize approval
    if (order.currentRoleApprovalId !== userApproval.roleId) {
      return true;
    }

    if (order.User.Role.roleName === "group head") {
      if (order.User.Organization.lineId == userApproval.Organization.lineId) {
        return true;
      }
    } else if (order.User.Role.roleName === "line head") {
      if (order.User.Organization.sectionId == userApproval.Organization.sectionId) {
        return true;
      }
    } else if (order.User.Role.roleName === "section head") {
      if (order.User.Organization.departmentId == userApproval.Organization.departmentId) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const isLastApproval = async (orderId) => {
  try {
    const order = await Order.findOne({ where: { id: orderId } });
    const lastApproval = order.isLastApproval;
    if (lastApproval) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const setCurrentRoleApprovalId = async (userId, transaction) => {
  try {
    // Ambil userApproval beserta organisasi dan role
    const userApproval = await User.findOne({
      where: { id: userId, flag: 1 },
      include: [
        {
          model: Organization,
          where: { flag: 1 },
        },
        {
          model: Role,
          where: { flag: 1 },
        },
      ],
    });

    // Jika user tidak ditemukan, lempar error
    if (!userApproval) {
      return false;
    }

    // Helper function untuk mengambil roleIdApproval
    const getRoleApprovalId = async (condition) => {
      return await User.findOne({ where: { ...condition, flag: 1 } });
    };

    // Logika untuk "line head"
    if (userApproval.Role.roleName === "line head") {
      const roleIdApproval = await getRoleApprovalId({ sectionId: userApproval.Organization.sectionId });
      const userIds = await getUserIdApproval({ sectionId: userApproval.Organization.sectionId });
      const notification = {
        title: "Request Approval",
        description: "Request Approval from Group Leader to Section Head",
        category: "approval",
      };
      await createNotification(userIds, notification, transaction);
      return roleIdApproval;
    }

    // Logika untuk "section head"
    if (userApproval.Role.roleName === "section head") {
      const roleIdApproval = await getRoleApprovalId({ departmentId: userApproval.Organization.departmentId });
      const userIds = await getUserIdApproval({ departmentId: userApproval.Organization.departmentId });
      const notification = {
        title: "Request Approval",
        description: "Request Approval from Section Head to Department Head",
        category: "approval",
      };
      await createNotification(userIds, notification, transaction);
      return roleIdApproval;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const isCertainPrice = async (orderId) => {
  const order = await Order.findOne({ where: { id: orderId } });
  return order.isMoreThanCertainPrice;
};

export const approveOrder = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const warehouseId = req.params.warehouseId;
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

    const orders = await DetailOrder.findAll({
      where: { orderId: orderId },
    });

    // Cek apakah user berwenang untuk approve
    if (!(await isAuthorizedApproval(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    let quantityBefore;
    let quantityAfter;
    const status = `approved ${role}`;

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
        typeLog: "approve",
        userId: userId,
        detailOrderId: detailOrder.id,
        quantityBefore: quantityBefore ? quantityBefore : null,
        quantityAfter: quantityAfter ? quantityAfter : null,
      })),
      { transaction }
    );

    // create order history
    await postOrderHistory(status, userId, orderId, { transaction });

    // Cek apakah ada approval terakhir
    const isLast = await isLastApproval(orderId);

    // Jika isLastApproval = 1, update isApproval = 1
    if (isLast == 1) {
      const order = await Order.update(
        { isApproval: 1, transactionNumber: await generateOrderNumber(1), status: "approved" },
        { where: { id: orderId }, transaction }
      );

      const userIds = await getUserIdWarehouse({ warehouseId: warehouseId });
      const notification = {
        title: "Request Order",
        description: "Request Order to Warehouse",
        category: "approval",
      };
      await createNotification(userIds, notification, transaction);

      // Commit transaksi setelah operasi berhasil
      await transaction.commit();

      // Respon success
      return res.status(200).json({
        message: "Approval success",
        status: "Approved",
        "transaction number": order.transactionNumber,
      });
    }

    // Jika isLastApproval = 0, update currentRoleApprovalId dan isLastApproval
    if (isLast == 0) {
      // Jika isCertainPrice = 1, update currentRoleApprovalId dan isLastApproval
      if ((await isCertainPrice(orderId)) == 1) {
        const order = await Order.update(
          { currentRoleApprovalId: await setCurrentRoleApprovalId(userId, orderId, transaction), isLastApproval: 1 },
          { where: { id: orderId }, transaction }
        );

        // Commit transaksi setelah operasi berhasil
        await transaction.commit();

        // Respon waiting approve
        return res.status(200).json({
          message: "Waiting for next approval",
          status: "Waiting approval",
          "request number": order.requestNumber,
        });
      }
    }
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectOrder = async (req, res) => {
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

    // Cek apakah user berwenang untuk reject
    if (!(await isAuthorizedApproval(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Update isReject di tabel DetailOrder
    await DetailOrder.update({ isReject: 1 }, { where: { id: detailOrderId }, transaction });

    // Create history reject di tabel LogApproval
    await LogApproval.create(
      {
        typeLog: "reject",
        userId: userId,
        detailOrderId: detailOrderId,
      },
      { transaction }
    );

    const status = `rejected ${role}`;

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

export const deleteOrderItem = async (req, res) => {
  const transaction = await db.transaction(); // Mulai transaksi
  try {
    const detailOrderId = req.params.detailOrderId;
    const userId = req.user.userId;

    const order = await DetailOrder.findOne({
      where: { id: detailOrderId },
      include: [
        {
          model: Order,
        },
      ],
    });

    // Cek isApproval
    if (order.Order.isApproval == 1) {
      await transaction.rollback(); // Batalkan transaksi jika order tidak ditemukan
      return res.status(404).json({ message: "Order already approved" });
    }

    // Cek apakah order ditemukan
    if (!order) {
      await transaction.rollback(); // Batalkan transaksi jika order tidak ditemukan
      return res.status(404).json({ message: "Order not found" });
    }

    const orderId = order.orderId;

    // Cek apakah user berwenang untuk reject
    if (!(await isAuthorizedApproval(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Update isDelete di tabel DetailOrder
    await DetailOrder.update({ isDelete: 1 }, { where: { id: detailOrderId }, transaction });

    // Create history delete di tabel LogApproval
    await LogApproval.create(
      {
        typeLog: "delete",
        userId: userId,
        detailOrderId: detailOrderId,
      },
      { transaction }
    );

    await transaction.commit(); // Commit transaksi setelah operasi berhasil

    res.status(200).json({
      message: "Delete success",
      status: "Deleted",
    });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
