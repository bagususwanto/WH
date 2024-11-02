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

const findRoleAndOrders = async (roleName, organizationField, organizationId, warehouseId) => {
  const role = await Role.findOne({ where: { roleName, flag: 1 } });
  return await Order.findAll({
    where: { isApproval: 0, currentRoleApprovalId: role.id },
    include: [
      {
        model: User,
        // required: true,
        attributes: ["id", "username", "name", "position", "img", "noHandphone", "email", "createdAt", "updatedAt"],
        include: [
          { model: Organization, where: { [organizationField]: organizationId } },
          {
            model: Warehouse,
            as: "alternateWarehouse", // Menggunakan alias di sini
            required: true,
            // where: { id: warehouseId },
          },
        ],
      },
    ],
  });
};

export const getOrderApproval = async (req, res) => {
  const role = req.query.role;
  const condition = getOrganizationCondition(req.user, role);
  const warehouseId = req.params.warehouseId;

  if (!condition) return res.status(400).json({ message: "Invalid role" });

  try {
    const orders = await findRoleAndOrders(role, condition.organizationField, condition.organizationId, warehouseId);
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findRoleAndDetailOrders = async (roleName, organizationField, organizationId, warehouseId) => {
  const role = await Role.findOne({ where: { roleName, flag: 1 } });
  return await Order.findAll({
    where: { isApproval: 0, currentRoleApprovalId: role.id },
    include: [
      {
        model: DetailOrder,
        where: { isReject: 0 },
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
          { model: Organization, where: { [organizationField]: organizationId } },
          {
            model: Warehouse,
            as: "alternateWarehouse", // Menggunakan alias di sini
            required: true,
            // where: { id: warehouseId },
          },
        ],
      },
    ],
  });
};

export const getDetailOrderApproval = async (req, res) => {
  const role = req.query.role;
  const condition = getOrganizationCondition(req.user, role);
  const warehouseId = req.params.warehouseId;

  if (!condition) return res.status(400).json({ message: "Invalid role" });

  try {
    const orders = await findRoleAndDetailOrders(role, condition.organizationField, condition.organizationId, warehouseId);
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

export const setCurrentRoleApprovalId = async (userId) => {
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
      return roleIdApproval;
    }

    // Logika untuk "section head"
    if (userApproval.Role.roleName === "section head") {
      const roleIdApproval = await getRoleApprovalId({ departmentId: userApproval.Organization.departmentId });
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
    const orderId = req.params.orderId;
    const userId = req.user.userId;
    const role = req.user.roleName;
    const orderDetails = req.body.orderDetails; // Ambil detail order dari req.body

    const orders = await DetailOrder.findAll({
      where: { orderId: orderId },
    });

    // Cek apakah user berwenang untuk approve
    if (!(await isAuthorizedApproval(orderId, userId))) {
      await transaction.rollback(); // Batalkan transaksi jika tidak berwenang
      return res.status(401).json({ message: "Unauthorized" });
    }

    let typeLog = "approve";
    let quantityBefore;
    let quantityAfter;
    let status;

    // Update quantity jika ada perubahan
    for (let order of orders) {
      const updatedOrder = orderDetails.find((detail) => detail.id === order.id);

      if (updatedOrder && updatedOrder.quantity !== order.quantity) {
        await DetailOrder.update({ quantity: updatedOrder.quantity }, { where: { id: order.id }, transaction });
        typeLog = "adjust";
        quantityBefore = order.quantity;
        quantityAfter = updatedOrder.quantity;
      }
    }

    if (role) {
      if (role === "line head") {
        status = "approved line head";
      } else if (role === "section head") {
        status = "approved section head";
      } else if (role === "department head") {
        status = "approved department head";
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

    // Cek apakah ada approval terakhir
    const isLast = await isLastApproval(orderId);

    // Jika isLastApproval = 1, update isApproval = 1
    if (isLast == 1) {
      const order = await Order.update({ isApproval: 1, transactionNumber: await generateOrderNumber(1) }, { where: { id: orderId }, transaction });

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
          { currentRoleApprovalId: await setCurrentRoleApprovalId(userId, orderId), isLastApproval: 1 },
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

    let status;

    if (role) {
      if (role === "line head") {
        status = "rejected line head";
      } else if (role === "section head") {
        status = "rejected section head";
      } else if (role === "department head") {
        status = "rejected department head";
      }
    }

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
