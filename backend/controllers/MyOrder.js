import Order from "../models/OrderModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import Material from "../models/MaterialModel.js";
import Storage from "../models/StorageModel.js";
import Inventory from "../models/InventoryModel.js";
import DetailOrder from "../models/DetailOrderModel.js";
import OrderHistory from "../models/OrderHistoryModel.js";
import { Op } from "sequelize";

// Get data product by warehouse
export const getMyOrder = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const userId = req.user.userId;

    const { page = 1, limit = 10, status, startDate, endDate, q } = req.query;
    const offset = (page - 1) * limit;

    // Buat kondisi where yang dinamis
    let whereCondition = { userId: userId };

    // Jika status tidak 'all', tambahkan status ke kondisi where
    if (status && status !== "all") {
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
        { requestNumber: { [Op.like]: `%${q}%` } },
        { "$Detail_Orders.Inventory.Material.description$": { [Op.like]: `%${q}%` } }, // Query terkait ke Material description
      ];
    }

    // Cari data my order berdasarkan filter dengan paginasi (limit dan offset)
    const myOrder = await Order.findAll({
      where: whereCondition,
      include: [
        {
          model: DetailOrder,
          required: true,
          include: [
            {
              model: Inventory,
              required: true,
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
                          where: { warehouseId: warehouseId, flag: 1 },
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
          model: OrderHistory,
          required: false,
          separate: true, // Query terpisah untuk memastikan pengurutan
          order: [["createdAt", "DESC"]],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]], // Sort by createdAt descending (terbaru di atas)
      subQuery: false, // Memastikan limit dan offset hanya diterapkan di tabel utama (Order)
    });

    res.status(200).json(myOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
