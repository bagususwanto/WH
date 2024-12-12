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

    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      q,
      isReject,
    } = req.query;
    const offset = (page - 1) * limit;

    // Buat kondisi where yang dinamis
    let whereCondition = { userId: userId };
    let whereCondition2 = { isDelete: 0, isReject: 0 };

    if (status && status !== "all") {
      whereCondition.status = status;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.transactionDate = {
        [Op.between]: [start, end],
      };
    }

    if (q) {
      whereCondition[Op.or] = [
        { transactionNumber: { [Op.like]: `%${q}%` } },
        { requestNumber: { [Op.like]: `%${q}%` } },
        {
          "$Detail_Orders.Inventory.Material.description$": {
            [Op.like]: `%${q}%`,
          },
        },
      ];
    }

    if (parseInt(isReject) === 1) {
      whereCondition2.isReject = 1;
    }

    // Hitung total data untuk menghitung totalPages
    const totalData = await Order.count({
      where: whereCondition,
      distinct: true,
      col: "id",
      include: [
        {
          model: DetailOrder,
          where: whereCondition2,
          required: true,
          include: [
            {
              model: Inventory,
              required: true,
              include: [
                {
                  model: Material,
                  required: true,
                  where: { flag: 1 },
                },
                {
                  model: AddressRack,
                  required: true,
                  where: { flag: 1 },
                  include: [
                    {
                      model: Storage,
                      required: true,
                      where: { flag: 1 },
                      include: [
                        {
                          model: Plant,
                          required: true,
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
      ],
    });

    const totalPages = Math.ceil(totalData / limit);

    let myOrder;

    if (isReject == 1) {
      myOrder = await Order.findAll({
        where: whereCondition,
        include: [
          {
            model: DetailOrder,
            where: whereCondition2,
            required: true,
            include: [
              {
                model: Inventory,
                required: true,
                include: [
                  {
                    model: Material,
                    required: true,
                    where: { flag: 1 },
                  },
                  {
                    model: AddressRack,
                    required: true,
                    where: { flag: 1 },
                    include: [
                      {
                        model: Storage,
                        required: true,
                        where: { flag: 1 },
                        include: [
                          {
                            model: Plant,
                            required: true,
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
            separate: true,
            required: false,
            order: [["createdAt", "DESC"]],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
        subQuery: false,
      });
    } else {
      myOrder = await Order.findAll({
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
                include: [
                  {
                    model: Material,
                    required: true,
                    where: { flag: 1 },
                  },
                  {
                    model: AddressRack,
                    required: true,
                    where: { flag: 1 },
                    include: [
                      {
                        model: Storage,
                        required: true,
                        where: { flag: 1 },
                        include: [
                          {
                            model: Plant,
                            required: true,
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
            separate: true,
            required: false,
            order: [["createdAt", "DESC"]],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
        subQuery: false,
      });
    }

    // Kirimkan response dengan data dan totalPages
    res.status(200).json({
      data: myOrder,
      totalPages: totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
