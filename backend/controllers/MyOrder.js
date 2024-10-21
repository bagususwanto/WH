import Order from "../models/OrderModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import Material from "../models/MaterialModel.js";
import Storage from "../models/StorageModel.js";
import Inventory from "../models/InventoryModel.js";
import DetailOrder from "../models/DetailOrderModel.js";

// Get data product by warehouse
export const getMyOrder = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const userId = req.user.userId;

    const { page = 1, limit = 10, status = "delivered" } = req.query; // Ambil limit dan page dari query params, default: 10 item per halaman
    const offset = (page - 1) * limit;

    // Cari data my order dengan paginasi (limit dan offset)
    const myOrder = await Order.findAll({
      where: { userId: userId, status: status },
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
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false, // Memastikan limit dan offset hanya diterapkan di tabel utama (Order)
    });

    res.status(200).json(myOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
