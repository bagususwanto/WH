import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Material from "../models/MaterialModel.js";
import Storage from "../models/StorageModel.js";
import Inventory from "../models/InventoryModel.js";
import { Op } from "sequelize";

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
          where: {
            flag: 1,
          },
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

export const getProductByQuery = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const { page = 1, limit = 20, q } = req.query;

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

    // Pisahkan query pencarian menjadi beberapa kata
    const queryKeywords = q ? q.split(" ") : [];

    // Cari data produk berdasarkan kata kunci yang ada di description atau materialNo
    const products = await Inventory.findAll({
      include: [
        {
          model: Material,
          where: {
            flag: 1,
            [Op.or]: [
              // Filter berdasarkan description
              {
                [Op.and]: queryKeywords.map((keyword) => ({
                  description: {
                    [Op.like]: `%${keyword}%`, // Setiap kata kunci harus ada di deskripsi
                  },
                })),
              },
              // Filter berdasarkan materialNo
              {
                [Op.and]: queryKeywords.map((keyword) => ({
                  materialNo: {
                    [Op.like]: `%${keyword}%`, // Setiap kata kunci harus ada di materialNo
                  },
                })),
              },
            ],
          },
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
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all product
export const getAllProduct = async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    const BATCH_SIZE = 500; // Ukuran batch yang diinginkan
    let products = [];
    let batchNumber = 0;
    let hasMore = true;

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

    // Loop untuk mengambil data dalam batch
    while (hasMore) {
      const batch = await Inventory.findAll({
        include: [
          {
            model: Material,
            attributes: ["id", "materialNo", "description"],
            where: {
              flag: 1,
            },
          },
          {
            model: AddressRack,
            attributes: ["id"],
            where: { flag: 1 },
            include: [
              {
                model: Storage,
                attributes: ["id"],
                where: { flag: 1 },
                include: [
                  {
                    model: Plant,
                    attributes: ["id"],
                    where: { warehouseId: warehouseId, flag: 1 },
                  },
                ],
              },
            ],
          },
        ],
        limit: BATCH_SIZE, // Ambil data dalam batch
        offset: batchNumber * BATCH_SIZE, // Mulai dari data ke berapa
      });

      products = [...products, ...batch]; // Gabungkan batch ke hasil products

      // Jika jumlah data dalam batch kurang dari BATCH_SIZE, maka sudah tidak ada data lagi
      if (batch.length < BATCH_SIZE) {
        hasMore = false;
      }

      batchNumber++; // Increment batch number
    }

    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
