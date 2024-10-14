import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Material from "../models/MaterialModel.js";
import Storage from "../models/StorageModel.js";
import Inventory from "../models/InventoryModel.js";

// Get data product by warehouse
export const getProduct = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const { page = 1, limit = 20 } = req.query; // Ambil limit dan page dari query params, default: 20 item per halaman

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

    // Cari data produk dengan paginasi (limit dan offset)
    const products = await Inventory.findAll({
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
      limit: parseInt(limit), // Tentukan jumlah data yang diambil (limit)
      offset: parseInt(offset), // Tentukan dari data ke berapa (offset)
    });

    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get data product by warehouse and Category
export const getProductByCategory = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const categoryId = req.params.categoryId;

    const { page = 1, limit = 20 } = req.query; // Ambil limit dan page dari query params, default: 20 item per halaman

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

    const product = await Inventory.findAll({
      include: [
        {
          model: Material,
          where: { flag: 1 },
          where: { categoryId: categoryId, flag: 1 },
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
      limit: parseInt(limit), // Tentukan jumlah data yang diambil (limit)
      offset: parseInt(offset), // Tentukan dari data ke berapa (offset)
    });

    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
