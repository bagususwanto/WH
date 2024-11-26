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
import { postOrderHistory } from "./OrderHistory.js";
import { createNotification } from "./Notification.js";
import { getUserIdApproval, getUserIdWarehouse } from "./Approval.js";

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
          [Op.in]: [
            "waiting approval",
            "waiting confirmation",
            "on process",
            "ready to pickup",
            "ready to deliver",
          ],
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
      return (
        sum +
        order.DetailOrder.reduce(
          (detailSum, detail) => detailSum + detail.quantity,
          0
        )
      );
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
  if (orderTimeStr === null) return false;
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

  // Jika user production dan role itu group head atau line head dan payment methods bukan GIC
  if (
    isProduction == 1 &&
    (role == "group head" || role == "line head") &&
    paymentMethod != "GIC"
  ) {
    return true;
  }
};

export const setApproval = async (userId, carts, warehouseId, transaction) => {
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
    const hasExpensiveMaterial = carts.some(
      (cart) => cart.Inventory.Material.price >= 20000000
    );

    // Helper function untuk mengambil roleIdApproval
    const getRoleApprovalId = async (condition) => {
      const user = await User.findOne({ where: { ...condition, flag: 1 } });
      return user ? user.roleId : null;
    };

    // Logika untuk "group head"
    if (user.Role.roleName == "group head") {
      // jika ada material dengan harga < 20jt
      if (!hasExpensiveMaterial) {
        if (user.Organization.lineId) {
          // Jika role group head
          const roleIdApproval = await getRoleApprovalId({
            lineId: user.Organization.lineId,
          });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval,
              isLastApproval: 1,
              isApproval: 0,
            });

            // create notification
            const userIds = await getUserIdApproval({
              lineId: user.Organization.lineId,
            });

            const notification = {
              title: "Request Approval",
              description: "Request Approval from Team Leader to Group Leader",
              category: "approval",
            };
            await createNotification(userIds, notification, transaction);

            return approval;
          }
        } // Jika lineId tidak ada atau tidak relevan, cek sectionId
        else if (user.Organization.sectionId) {
          const roleIdApproval = await getRoleApprovalId({
            sectionId: user.Organization.sectionId,
          });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval,
              isLastApproval: 1,
              isApproval: 0,
            });
            // create notification
            const userIds = await getUserIdApproval({
              sectionId: user.Organization.sectionId,
            });
            const notification = {
              title: "Request Approval",
              description: "Request Approval from Team Leader to Section Head",
              category: "approval",
            };
            await createNotification(userIds, notification, transaction);

            return approval;
          }
        } // Jika sectionId tidak ada, cek departmentId
        else if (user.Organization.departmentId) {
          const roleIdApproval = await getRoleApprovalId({
            departmentId: user.Organization.departmentId,
          });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval,
              isLastApproval: 1,
              isApproval: 0,
            });
            // create notification
            const userIds = await getUserIdApproval({
              departmentId: user.Organization.departmentId,
            });
            const notification = {
              title: "Request Approval",
              description:
                "Request Approval from Team Leader to Department Head",
              category: "approval",
            };
            await createNotification(userIds, notification, transaction);

            return approval;
          }
        }
      } else {
        // Jika ada material dengan harga >= 20jt
        if (user.Organization.lineId) {
          // Jika role group head
          const roleIdApproval = await getRoleApprovalId({
            lineId: user.Organization.lineId,
          });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval,
              isLastApproval: 0,
              isApproval: 0,
            });
            // create notification
            const userIds = await getUserIdApproval({
              lineId: user.Organization.lineId,
            });
            const notification = {
              title: "Request Approval",
              description: "Request Approval from Team Leader to Group Leader",
              category: "approval",
            };
            await createNotification(userIds, notification, transaction);

            return approval;
          }
        } // Jika lineId tidak ada atau tidak relevan, cek sectionId
        else if (user.Organization.sectionId) {
          const roleIdApproval = await getRoleApprovalId({
            sectionId: user.Organization.sectionId,
          });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval,
              isLastApproval: 1,
              isApproval: 0,
            });
            // create notification
            const userIds = await getUserIdApproval({
              sectionId: user.Organization.sectionId,
            });
            const notification = {
              title: "Request Approval",
              description: "Request Approval from Team Leader to Section Head",
              category: "approval",
            };
            await createNotification(userIds, notification, transaction);

            return approval;
          }
        } // Jika sectionId tidak ada, cek departmentId
        else if (user.Organization.departmentId) {
          const roleIdApproval = await getRoleApprovalId({
            departmentId: user.Organization.departmentId,
          });
          if (roleIdApproval) {
            approval.push({
              currentRoleApprovalId: roleIdApproval,
              isLastApproval: 1,
              isApproval: 0,
            });
            // create notification
            const userIds = await getUserIdApproval({
              departmentId: user.Organization.departmentId,
            });
            const notification = {
              title: "Request Approval",
              description:
                "Request Approval from Team Leader to Department Head",
              category: "approval",
            };
            await createNotification(userIds, notification, transaction);

            return approval;
          }
        }
      }
    }

    // Logika untuk "line head"
    if (user.Role.roleName == "line head" && hasExpensiveMaterial) {
      // Jika role line head dan harga >= 20jt, set role approval berdasarkan sectionId
      if (user.Organization.sectionId) {
        const roleIdApproval = await getRoleApprovalId({
          sectionId: user.Organization.sectionId,
        });
        if (roleIdApproval) {
          approval.push({
            currentRoleApprovalId: roleIdApproval,
            isLastApproval: 1,
            isApproval: 0,
          });
          // create notification
          const userIds = await getUserIdApproval({
            sectionId: user.Organization.sectionId,
          });
          const notification = {
            title: "Request Approval",
            description: "Request Approval from Group Leader to Section Head",
            category: "approval",
          };
          await createNotification(userIds, notification, transaction);

          return approval;
        }
      } // Jika sectionId tidak ada, cek departmentId
      else if (user.Organization.departmentId) {
        const roleIdApproval = await getRoleApprovalId({
          departmentId: user.Organization.departmentId,
        });
        if (roleIdApproval) {
          approval.push({
            currentRoleApprovalId: roleIdApproval,
            isLastApproval: 1,
            isApproval: 0,
          });
          // create notification
          const userIds = await getUserIdApproval({
            departmentId: user.Organization.departmentId,
          });
          const notification = {
            title: "Request Approval",
            description:
              "Request Approval from Group Leader to Department Head",
            category: "approval",
          };
          await createNotification(userIds, notification, transaction);

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

    // create notification
    const userIds = await getUserIdWarehouse({ warehouseId: warehouseId });
    const notification = {
      title: "Request Order",
      description: "Request Order to Warehouse",
      category: "approval",
    };
    await createNotification(userIds, notification, transaction);

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
    const today = new Date(new Date().getTime() - 8 * 60 * 60 * 1000);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;

    // Tentukan prefix berdasarkan isApproval
    const prefix = isApproval == 1 ? "TRS" : "REQ";

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
      const lastTransactionNumber =
        isApproval == 1 && lastOrder
          ? lastOrder.transactionNumber
          : isApproval == 0 && lastOrder
          ? lastOrder.requestNumber
          : lastOrder;

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
              required: false,
              where: { flag: 1 },
              include: [
                {
                  model: Group,
                  where: { flag: 1 },
                  required: false,
                },
                {
                  model: Line,
                  where: { flag: 1 },
                  required: false,
                },
                {
                  model: Section,
                  where: { flag: 1 },
                  required: false,
                  include: [
                    {
                      model: WBS,
                      where: { wbsYear: new Date().getFullYear(), flag: 1 },
                      required: false,
                    },
                    {
                      model: GIC,
                      where: { flag: 1 },
                      required: false,
                      include: [
                        {
                          model: CostCenter,
                          where: { flag: 1 },
                          required: false,
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Department,
                  where: { flag: 1 },
                  required: false,
                },
                {
                  model: Division,
                  where: { flag: 1 },
                  required: false,
                },
                {
                  model: Plant,
                  where: { flag: 1 },
                  required: false,
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
      return res
        .status(400)
        .json({ message: "cartIds must be a non-empty array" });
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
      return res.status(400).json({ message: "Item not found" });
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
    const warehouseId = req.params.warehouseId;
    const userId = req.user.userId;
    const cartIds = req.body.cartIds; // ex: [1, 2, 3]
    const remarks = req.body.remarks;
    const orderTimeStr = req.body.orderTime; // ex: "07:30"
    const paymentNumber = req.body.paymentNumber; // ex: "4000000061" or "F3.Y2024.0031.51101R0100"
    const paymentMethod = req.body.paymentMethod; // ex: "GIC" or "WBS"
    const deliveryMethod = req.body.deliveryMethod; // ex: "Otodoke" or "Pickup"
    const isProduction = req.user.isProduction;
    const role = req.user.roleName;

    // Validasi jika setiap nilai kosong
    if (deliveryMethod == "pickup") {
      if (!cartIds || !paymentNumber || !paymentMethod || !deliveryMethod) {
        return res.status(400).json({ message: "All fields are required" });
      }
    } else {
      if (
        !cartIds ||
        !orderTimeStr ||
        !paymentNumber ||
        !paymentMethod ||
        !deliveryMethod
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
    }

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
      return res.status(400).json({ message: "Some item not found" });
    }

    // Jika quantity order < min order
    if (!(await isMinimumOrderQuantity(cartIds))) {
      return res.status(400).json({ message: "Quantity order not valid" });
    }

    // Jika waktu pengiriman tidak valid
    if (isLateDelivery(orderTimeStr)) {
      return res.status(400).json({ message: "Delivery time not valid" });
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
      return res.status(400).json({ message: "Payment methode not valid" });
    }

    // Simpan data validasi price
    let isMoreThanCertainPrice = 0;

    // check material price >= 20jt
    if (carts.some((cart) => cart.Inventory.Material.price >= 20000000)) {
      // Jika material price >= 20jt
      isMoreThanCertainPrice = 1;
    }

    const approval = await setApproval(userId, carts, warehouseId, t);

    if (approval === false) {
      // Jika approval tidak valid
      return res.status(400).json({ message: "Approval not valid" });
    }

    if (approval.length === 0) {
      // Jika approval tidak ditemukan
      return res.status(400).json({ message: "Approval not found" });
    }

    const fullTransactionNo = await generateOrderNumber(approval[0].isApproval);
    const leftTransactionNo = fullTransactionNo.slice(0, 2); // Mengambil 2 digit pertama

    // Create order
    const order = await Order.create(
      {
        userId: userId,
        requestNumber: leftTransactionNo == "RE" ? fullTransactionNo : null,
        transactionNumber: leftTransactionNo == "TR" ? fullTransactionNo : null,
        transactionDate: new Date(new Date().getTime() - 8 * 60 * 60 * 1000),
        totalPrice: carts.reduce(
          (acc, cart) => acc + cart.Inventory.Material.price * cart.quantity,
          0
        ),
        paymentNumber: paymentNumber,
        paymentMethod: paymentMethod,
        status:
          leftTransactionNo == "TR"
            ? "waiting confirmation"
            : "waiting approval",
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
        price: cart.Inventory.Material.price * cart.quantity,
        isMoreThanCertainPrice:
          cart.Inventory.Material.price >= 20000000 ? 1 : 0,
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

    // Memulai transaksi kedua untuk postOrderHistory
    const t2 = await db.transaction(); // Memulai transaksi kedua

    try {
      // Transaksi kedua untuk mencatat sejarah pesanan
      await postOrderHistory("order created", userId, order.id, {
        transaction: t2,
      });

      // Commit transaksi kedua
      await t2.commit();
    } catch (error) {
      // Rollback transaksi kedua jika terjadi error
      await t2.rollback();
      console.log(error);
      return res
        .status(500)
        .json({ message: "Internal server error on create order history" });
    }

    // Jika semua validasi sukses
    res.status(200).json({ message: "Order created" });
  } catch (error) {
    // Rollback transaksi pertama jika terjadi error
    await t.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
