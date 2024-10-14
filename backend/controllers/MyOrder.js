import Order from "../models/OrderModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Material from "../models/MaterialModel.js";
import Storage from "../models/StorageModel.js";
import Inventory from "../models/InventoryModel.js";
import DetailOrder from "../models/DetailOrderModel.js";

// Get data product by warehouse
export const getMyOrder = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const userId = req.user.userId;

    const { page = 1, limit = 10 } = req.query; // Ambil limit dan page dari query params, default: 10 item per halaman

    // Hitung nilai offset berdasarkan halaman
    const offset = (page - 1) * limit;

    const warehouse = await Warehouse.findOne({
      where: { id: warehouseId, flag: 1 },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const plant = await Plant.findOne({
      where: { warehouseId: warehouseId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Cari data my order dengan paginasi (limit dan offset)
    const myOrder = await Order.findAll({
      where: { userId: userId, status: "completed" },
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
    });

    res.status(200).json(myOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
