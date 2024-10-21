import db from "../utils/Database.js";
import Cart from "../models/CartModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Order from "../models/OrderModel.js";
import DetailOrder from "../models/DetailOrderModel.js";
import LogEntry from "../models/LogEntryModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import Warehouse from "../models/WarehouseModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import ServiceHours from "../models/ServiceHoursModel.js";
import WBS from "../models/WBSModel.js";
import GIC from "../models/GICModel.js";
import Section from "../models/SectionModel.js";
import Organization from "../models/OrganizationModel.js";
import Storage from "../models/StorageModel.js";
import Group from "../models/GroupModel.js";
import Line from "../models/LineModel.js";
import Division from "../models/DivisionModel.js";
import Department from "../models/DepartmentModel.js";
import CostCenter from "../models/CostCenterModel.js";
import Role from "../models/RoleModel.js";

// cek stock
export const checkStock = async (inventoryId, quantity) => {
  try {
    // Ambil data inventory berdasarkan inventoryId
    const inventory = await Inventory.findOne({
      where: {
        inventoryId,
      },
    });

    // Ambil semua order terkait dengan status tertentu dan inventoryId di DetailOrder
    const orders = await Order.findOne({
      where: {
        status: {
          [Op.in]: ["waiting approval", "on process", "ready to pickup", "ready to deliver"],
        },
      },
      include: [
        {
          model: DetailOrder,
          where: {
            inventoryId,
          },
        },
      ],
    });

    // Hitung total quantity dari semua DetailOrder yang terkait
    const totalOrderedQuantity = orders.reduce((sum, order) => {
      return sum + order.DetailOrder.reduce((detailSum, detail) => detailSum + detail.quantity, 0);
    }, 0);

    // Hitung sisa stok yang ada di inventory sekarang - total order quantity yang masih proses
    const stock = inventory.quantityActualCheck - totalOrderedQuantity;

    // Periksa apakah stok cukup untuk kuantitas yang diminta
    if (stock < quantity) {
      return false; // Stok tidak cukup
    } else {
      return true; // Stok cukup
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to check stock");
  }
};

// Handle schedule delivery
const isLateDelivery = (orderTimeStr) => {
  const [orderHour, orderMinute] = orderTimeStr.split(":").map(Number);
  const currentTime = new Date();
  const orderTime = new Date(currentTime);
  orderTime.setHours(orderHour, orderMinute, 0);

  return orderTime < currentTime; // Mengembalikan true jika terlambat
};

// Handle Stock
const isStockAvailable = async (cartIds) => {
  // Fetch all carts in one query with related data (Inventory and Material)
  const carts = await Cart.findAll({
    where: {
      id: cartIds,
    },
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
  });

  // Create an array to store carts with insufficient stock
  let insufficientStock = [];

  // Check stock for all carts in parallel
  await Promise.all(
    carts.map(async (cart) => {
      const stock = await checkStock(cart.inventoryId, cart.quantity);

      // If stock is not sufficient, store the cart details in insufficientStock array
      if (!stock) {
        insufficientStock.push({
          cartId: cart.id,
          materialNo: cart.Inventory.Material.materialNo,
          description: cart.Inventory.Material.description,
        });
      }
    })
  );

  // Return carts, status (true if all stock is available), and insufficient stock details if any
  return {
    carts,
    isAvailable: insufficientStock.length === 0, // True if no insufficient stock
    insufficientStock, // Contains details of carts with insufficient stock
  };
};

const isPaymentValid = (isProduction, role, paymentMethod) => {
  // Jika user non production dan payment methods bukan WBS
  if (isProduction == 0 && paymentMethod != "WBS") {
    return true;
  }

  // Jika user role itu section head dan payment methods bukan WBS
  if (role == "section head" && paymentMethod != "WBS") {
    return true;
  }

  // Jika user production dan role itu group leader atau team leader dan payment methods bukan GIC
  if (isProduction == 1 && (role == "group leader" || role == "team leader") && paymentMethod != "GIC") {
    return true;
  }
};

export const setApproval = async (userId, carts) => {
  try {
    // Ambil user beserta organisasi dan role
    const user = await User.findOne({
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
    if (!user) {
      return false;
    }

    let approval = [];

    // Variabel untuk mengecek apakah ada material dengan harga >= 20jt
    const hasExpensiveMaterial = carts.some((cart) => cart.Inventory.Material.price >= 20000000);

    // Helper function untuk mengambil roleIdApproval
    const getRoleApprovalId = async (condition) => {
      return await User.findOne({ where: { ...condition, flag: 1 } });
    };

    // Logika untuk "group head"
    if (user.roleName === "group head") {
      // jika ada material dengan harga < 20jt
      if (!hasExpensiveMaterial) {
        if (user.Organization.lineId) {
          // Jika role group head
          const roleIdApproval = await getRoleApprovalId({ lineId: user.Organization.lineId });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval.roleId,
              isLastApproval: 1,
              isApproval: 0,
            });
            return approval;
          }
        }

        // Jika lineId tidak ada atau tidak relevan, cek sectionId
        if (user.Organization.sectionId) {
          const roleIdApproval = await getRoleApprovalId({ sectionId: user.Organization.sectionId });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval.roleId,
              isLastApproval: 1,
              isApproval: 0,
            });
            return approval;
          }
        }

        // Jika sectionId tidak ada, cek departmentId
        if (user.Organization.departmentId) {
          const roleIdApproval = await getRoleApprovalId({ departmentId: user.Organization.departmentId });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval.roleId,
              isLastApproval: 1,
              isApproval: 0,
            });
            return approval;
          }
        }
      } else {
        // Jika ada material dengan harga >= 20jt
        if (user.Organization.lineId) {
          // Jika role group head
          const roleIdApproval = await getRoleApprovalId({ lineId: user.Organization.lineId });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval.roleId,
              isLastApproval: 0,
              isApproval: 0,
            });
            return approval;
          }
        }

        // Jika lineId tidak ada atau tidak relevan, cek sectionId
        if (user.Organization.sectionId) {
          const roleIdApproval = await getRoleApprovalId({ sectionId: user.Organization.sectionId });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval.roleId,
              isLastApproval: 1,
              isApproval: 0,
            });
            return approval;
          }
        }

        // Jika sectionId tidak ada, cek departmentId
        if (user.Organization.departmentId) {
          const roleIdApproval = await getRoleApprovalId({ departmentId: user.Organization.departmentId });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval.roleId,
              isLastApproval: 1,
              isApproval: 0,
            });
            return approval;
          }
        }
      }
    }

    // Logika untuk "line head"
    if (user.roleName === "line head" && hasExpensiveMaterial) {
      // Jika role line head dan harga >= 20jt, set role approval berdasarkan sectionId
      if (user.Organization.sectionId) {
        const roleIdApproval = await getRoleApprovalId({ sectionId: user.Organization.sectionId });
        if (roleIdApproval) {
          approval.push({
            currentRoleApprovalId: roleIdApproval.roleId,
            isLastApproval: 1,
            isApproval: 0,
          });
          return approval;
        }
      }

      // Jika sectionId tidak ada, cek departmentId
      if (user.Organization.departmentId) {
        const roleIdApproval = await getRoleApprovalId({ departmentId: user.Organization.departmentId });
        if (roleIdApproval) {
          approval.push({
            currentRoleApprovalId: roleIdApproval.roleId,
            isLastApproval: 1,
            isApproval: 0,
          });
          return approval;
        }
      }
    }

    // Jika tidak ada kondisi yang terpenuhi langsung ubah isApproval 1 untuk byPass ke Warehouse
    approval.push({
      currentRoleApprovalId: 0,
      isLastApproval: 1,
      isApproval: 1,
    });
    return approval;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// generate transaction number
export const generateOrderNumber = async (isApproval) => {
  try {
    // Dapatkan tanggal hari ini dalam format YYYYMMDD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;

    // Tentukan prefix berdasarkan isApproval
    const prefix = isApproval == 1 ? "TR" : "REQ";

    // Cari sequence terbaru untuk hari ini
    const lastOrder = await Order.findOne({
      where: {
        createdAt: {
          [Op.gte]: new Date(`${year}-${month}-${day} 00:00:00`),
          [Op.lte]: new Date(`${year}-${month}-${day} 23:59:59`),
        },
      },
      order: [["createdAt", "DESC"]],
    });

    // Tentukan sequence number berdasarkan transaksi terakhir
    let sequenceNumber = 1;
    if (lastOrder) {
      // Ambil sequence number dari transaksi terakhir dan tambahkan 1
      const lastTransactionNumber = isApproval == 1 && lastOrder ? lastOrder.transactionNumber : lastOrder ? lastOrder.requestNumber : null;

      // Periksa apakah lastTransactionNumber valid
      if (lastTransactionNumber) {
        const lastSequence = parseInt(lastTransactionNumber.slice(-4), 10); // Ambil 4 digit terakhir sebagai sequence
        sequenceNumber = isNaN(lastSequence) ? 1 : lastSequence + 1;
      } else {
        sequenceNumber = 1; // Jika lastTransactionNumber null, mulai dari sequence 1
      }
    } else {
      sequenceNumber = 1; // Jika tidak ada lastOrder, mulai dari sequence 1
    }

    // Pad sequence number menjadi 4 digit
    const formattedSequence = String(sequenceNumber).padStart(4, "0");

    // Gabungkan prefix, tanggal, dan sequence number
    const transactionNumber = `${prefix}-${formattedDate}${formattedSequence}`;

    return transactionNumber;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getCheckoutData = async (cartIds) => {
  try {
    return await Cart.findAll({
      where: {
        id: cartIds,
      },
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
              include: [
                {
                  model: Storage,
                  where: { flag: 1 },
                  include: [
                    {
                      model: Plant,
                      where: { flag: 1 },
                      include: [
                        {
                          model: Warehouse,
                          where: { flag: 1 },
                          include: [
                            {
                              model: ServiceHours,
                              where: { flag: 1 },
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
          attributes: ["id", "username", "name", "position"],
          include: [
            {
              model: Organization,
              where: { flag: 1 },
              include: [
                {
                  model: Group,
                  where: { flag: 1 },
                },
                {
                  model: Line,
                  where: { flag: 1 },
                },
                {
                  model: Section,
                  where: { flag: 1 },
                  include: [
                    {
                      model: WBS,
                      where: { wbsYear: new Date().getFullYear(), flag: 1 },
                    },
                    {
                      model: GIC,
                      where: { flag: 1 },
                      include: [
                        {
                          model: CostCenter,
                          where: { flag: 1 },
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Department,
                  where: { flag: 1 },
                },
                {
                  model: Division,
                  where: { flag: 1 },
                },
                {
                  model: Plant,
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.log(error);
    return false;
  }
};

// order checkout
export const checkout = async (req, res) => {
  try {
    const cartIds = req.body.cartIds;

    if (!Array.isArray(cartIds) || cartIds.length === 0) {
      return res.status(400).json({ message: "cartIds harus berupa array dan tidak boleh kosong" });
    }

    // const stockStatus = await isStockAvailable(cartIds);

    // if (!stockStatus.isAvailable) {
    //   return res.status(400).json({
    //     message: "Stok tidak tersedia untuk beberapa item",
    //     insufficientStock: stockStatus.insufficientStock, // Menampilkan item dengan stok tidak mencukupi
    //   });
    // }

    const carts = await getCheckoutData(cartIds);

    if (carts === false) {
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }

    if (carts.length === 0) {
      return res.status(400).json({ message: "Tidak ada item yang dipilih" });
    }

    // Jika semua validasi sukses
    res.status(200).json(carts);
  } catch (error) {
    console.log(error);
    // Mengembalikan pesan error yang lebih spesifik jika ada
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

const isMinimumOrderQuantity = async (cartIds) => {
  const carts = await Cart.findAll({
    where: {
      id: cartIds,
    },
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
  });

  carts.map((cart) => {
    if (cart.quantity < cart.Inventory.Material.minOrder) {
      return false;
    }
  });
  return true;
};

// create order
export const createOrder = async (req, res) => {
  const t = await db.transaction(); // Memulai transaksi

  try {
    const userId = req.user.userId;
    const cartIds = req.body.cartIds; // ex: [1, 2, 3]
    const remarks = req.body.remarks;
    const orderTimeStr = req.body.orderTime; // ex: "07:30"
    const paymentNumber = req.body.paymentNumber; // ex: "4000000061" or "F3.Y2024.0031.51101R0100"
    const paymentMethod = req.body.paymentMethod; // ex: "GIC" or "WBS"
    const deliveryMethod = req.body.deliveryMethod; // ex: "Otodoke" or "Pickup"
    const isProduction = req.user.isProduction;
    const role = req.user.roleName;

    const carts = await Cart.findAll({
      where: {
        id: cartIds,
      },
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
    });

    if (carts.length !== cartIds.length) {
      return res.status(400).json({ message: "Beberapa ID cart tidak valid" });
    }

    // Jika quantity order < min order
    if (!(await isMinimumOrderQuantity(cartIds))) {
      return res.status(400).json({ message: "Quantity order tidak boleh kurang dari min order" });
    }

    // Jika waktu pengiriman tidak valid
    if (isLateDelivery(orderTimeStr)) {
      return res.status(400).json({ message: "Waktu pengiriman tidak valid diluar jam antar" });
    }

    // Pemanggilan fungsi isStockAvailable
    // const stockStatus = await isStockAvailable(cartIds);
    // const carts = stockStatus.carts;

    // check ketersediaan  stok
    // if (!stockStatus.isAvailable) {
    //   // Jika stok tidak tersedia
    //   return res.status(400).json({
    //     message: "Stok tidak tersedia untuk beberapa item",
    //     insufficientStock: stockStatus.insufficientStock, // Menampilkan item dengan stok tidak mencukupi
    //   });
    // }

    // check payment method
    if (isPaymentValid(isProduction, role, paymentMethod)) {
      // Jika metode pembayaran tidak valid
      return res.status(400).json({ message: "Metode pembayaran tidak valid" });
    }

    // Simpan data validasi price
    let isMoreThanCertainPrice = 0;

    // check material price >= 20jt
    if (carts.some((cart) => cart.Inventory.Material.price >= 20000000)) {
      // Jika material price >= 20jt
      isMoreThanCertainPrice = 1;
    }

    const approval = await setApproval(userId, carts);

    if (approval === false) {
      // Jika approval tidak valid
      return res.status(400).json({ message: "Approval tidak valid" });
    }

    if (approval.length === 0) {
      // Jika approval tidak ditemukan
      return res.status(400).json({ message: "Approval tidak ditemukan" });
    }

    const fullTransactionNo = await generateOrderNumber(approval[0].isApproval);
    const leftTransactionNo = fullTransactionNo.slice(0, 2); // Mengambil 2 digit pertama

    // Create order
    const order = await Order.create(
      {
        userId: userId,
        requestNumber: leftTransactionNo == "REQ" ? fullTransactionNo : null,
        transactionNumber: leftTransactionNo == "TR" ? fullTransactionNo : null,
        totalPrice: carts.reduce((acc, cart) => acc + cart.Inventory.Material.price * cart.quantity, 0),
        paymentNumber: paymentNumber,
        paymentMethod: paymentMethod,
        status: leftTransactionNo == "TR" ? "delivered" : "waiting approval",
        scheduleDelivery: orderTimeStr,
        deliveryMethod: deliveryMethod,
        remarks: remarks,
        currentRoleApprovalId: approval[0].currentRoleApprovalId,
        isLastApproval: approval[0].isLastApproval,
        isMoreThanCertainPrice: isMoreThanCertainPrice,
        isApproval: approval[0].isApproval,
      },
      { transaction: t }
    ); // Menambahkan transaksi

    // create detail order
    const detailOrders = await DetailOrder.bulkCreate(
      carts.map((cart) => ({
        orderId: order.id,
        inventoryId: cart.inventoryId,
        quantity: cart.quantity,
        price: cart.Inventory.Material.price,
        isMoreThanCertainPrice: cart.Inventory.Material.price >= 20000000 ? 1 : 0,
      })),
      { transaction: t } // Menambahkan transaksi
    );

    // Delete all carts
    await Cart.destroy({
      where: {
        id: cartIds,
      },
      transaction: t, // Menambahkan transaksi
    });

    // Create log entries for each detail order
    await Promise.all(
      detailOrders.map(async (detailOrder) => {
        await LogEntry.create(
          {
            typeLogEntry: "create order",
            quantity: detailOrder.quantity,
            userId: req.user.userId,
            detailOrderId: detailOrder.id, // assuming there's an id in detailOrder
            inventoryId: detailOrder.inventoryId,
            incomingId: null,
          },
          { transaction: t }
        );
      })
    );

    // Commit transaksi jika semua berhasil
    await t.commit();

    // Jika semua validasi sukses
    res.status(200).json({ message: "Order berhasil" });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await t.rollback();

    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
