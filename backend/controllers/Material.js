import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Packaging from "../models/PackagingModel.js";
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";
import LogImport from "../models/LogImportModel.js";
import db from "../utils/Database.js";
import Inventory from "../models/InventoryModel.js";
import AddressRack from "../models/AddressRackModel.js";
import MaterialStorage from "../models/MaterialStorageModel.js";
import LogEntry from "../models/LogEntryModel.js";
import Incoming from "../models/IncomingModel.js";
import sequelize, { Op } from "sequelize";
import Warehouse from "../models/WarehouseModel.js";
import { formatDate } from "../utils/helper.js";

let batchSize = 1000; // Set batch size sesuai kebutuhan

export const getMaterial = async (req, res) => {
  try {
    const { storageId, plantId, type } = req.query;

    const whereCondition = { flag: 1, ...(type && { type }) };
    const whereConditionStorage = storageId
      ? { flag: 1, id: storageId }
      : { flag: 1 };
    const whereConditionPlant = plantId
      ? { flag: 1, id: plantId }
      : { flag: 1 };

    // Hitung total jumlah data
    const totalCount = await Material.count({ where: whereCondition });

    // Hitung jumlah batch
    const totalBatches = Math.ceil(totalCount / batchSize);

    let allData = [];

    for (let batch = 0; batch < totalBatches; batch++) {
      const offset = batch * batchSize;

      const batchData = await Material.findAll({
        where: whereCondition,
        limit: parseInt(batchSize), // Ambil batchSize per iterasi
        offset: offset, // Mulai dari posisi offset
        include: [
          { model: Packaging, required: false, where: { flag: 1 } },
          { model: Category, where: { flag: 1 } },
          { model: Supplier, required: false, where: { flag: 1 } },
          {
            model: Inventory,
            required: true,
            attributes: ["id", "materialId", "addressId"],
            include: [
              {
                model: AddressRack,
                required: true,
                where: { flag: 1 },
                include: [
                  {
                    model: Storage,
                    required: true,
                    where: whereConditionStorage,
                    include: [
                      {
                        model: Plant,
                        required: true,
                        where: whereConditionPlant,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          ...["create", "update"].map((action) => ({
            model: LogMaster,
            required: false,
            as: `${action}dBy`,
            attributes: ["id", "createdAt", "userId"],
            where: { masterType: "Material", action },
            include: [
              { model: User, required: false, attributes: ["id", "username"] },
            ],
            order: [["createdAt", "DESC"]],
            limit: 1,
          })),
          {
            model: LogImport,
            required: false,
            attributes: ["id", "createdAt", "userId"],
            include: [
              { model: User, required: false, attributes: ["id", "username"] },
            ],
          },
        ],
      });

      allData = allData.concat(batchData);
    }

    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const response = await Material.findOne({
      where: {
        id: materialId,
        flag: 1,
      },
      include: [
        {
          model: Category,
          where: { flag: 1 },
        },
        {
          model: Supplier,
          where: { flag: 1 },
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMaterialIdByMaterialNo = async (req, res) => {
  try {
    const response = await Material.findOne({
      where: { materialNo: req.params.materialNo, flag: 1 },
      attributes: ["id"],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMaterial = async (req, res) => {
  const transaction = await db.transaction();
  try {
    // Body
    const {
      materialNo,
      description,
      uom,
      price,
      type,
      mrpType,
      minStock,
      maxStock,
      categoryId,
      supplierId,
      packagingId,
      addressRackId,
      minOrder,
    } = req.body;

    // Validasi data tersedia
    if (
      !materialNo ||
      !description ||
      !uom ||
      !type ||
      !mrpType ||
      !minStock ||
      minStock === 0 ||
      !maxStock ||
      maxStock === 0 ||
      !categoryId ||
      !supplierId ||
      !minOrder ||
      minOrder === 0 ||
      !addressRackId
    ) {
      return res.status(400).json({
        message: "All fields are required, except packaging and unit packaging",
      });
    }

    const category = categoryId;
    const supplier = supplierId;
    const packaging = packagingId;
    const addressRack = addressRackId;

    // Cek materialNo
    const existingMaterial = await Material.findOne({
      where: { materialNo: materialNo, flag: 1 },
    });
    if (existingMaterial) {
      return res.status(400).json({ message: "Material already exists" });
    }

    // Cek category
    const existCategory = await Category.findOne({
      where: { id: category.value, flag: 1 },
    });
    if (!existCategory) {
      return res.status(400).json({
        message:
          "Category not found, plese check it out first Category master data",
      });
    }

    // Cek supplier
    const existSupplier = await Supplier.findOne({
      where: { id: supplier.value, flag: 1 },
    });
    if (!existSupplier) {
      return res.status(400).json({
        message:
          "Supplier not found, please check it out first Supplier master data",
      });
    }

    if (packaging) {
      // Cek packaging
      const existPackaging = await Packaging.findOne({
        where: { id: packaging.value, flag: 1 },
      });
      if (!existPackaging) {
        return res.status(400).json({
          message:
            "Packaging not found, please check it out first Packaging master data",
        });
      }
    }

    // Cek address rack
    const existAddressRack = await AddressRack.findOne({
      where: { id: addressRack.value, flag: 1 },
    });
    if (!existAddressRack) {
      return res.status(400).json({
        message:
          "Address rack not found, please check it out first Address rack master data",
      });
    }

    // Buat material baru
    const newMaterial = await Material.create(
      {
        materialNo,
        description,
        uom: uom.value,
        price,
        type: type.value,
        mrpType: mrpType.value,
        minStock,
        maxStock,
        minOrder,
        packagingId: packaging?.value,
        categoryId: category.value,
        supplierId: supplier.value,
      },
      { userId: req.user.userId, transaction }
    );

    // Buat inventory baru
    const newInventory = await Inventory.create(
      {
        materialId: newMaterial.id,
        addressId: addressRack.value,
      },
      { userId: req.user.userId, transaction }
    );

    // Buat log
    await LogEntry.create(
      {
        inventoryId: newInventory.id,
        typeLogEntry: "create inventory",
        userId: req.user.userId,
      },
      { transaction }
    );

    // cek materialStorage
    const materialStorage = await MaterialStorage.findOne(
      {
        where: { materialId: newMaterial.id },
      },
      { transaction }
    );
    if (materialStorage) {
      await materialStorage.update(
        {
          storageId: existAddressRack.storageId,
        },
        {
          where: { materialId: newMaterial.id, flag: 1 },
          userId: req.user.userId,
          transaction,
        }
      );
    } else {
      // Hubungkan material dengan storage
      await MaterialStorage.create(
        {
          materialId: newMaterial.id,
          storageId: existAddressRack.storageId,
        },
        { userId: req.user.userId, transaction }
      );
    }

    await transaction.commit();
    res
      .status(201)
      .json({ message: "Material Created", material: newMaterial });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterial = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const materialId = req.params.id;

    // Body
    const {
      description,
      uom,
      price,
      type,
      mrpType,
      minStock,
      maxStock,
      categoryId,
      supplierId,
      packagingId,
      addressRackId,
      minOrder,
    } = req.body;

    // Validasi data tersedia
    if (
      !description ||
      !uom ||
      !type ||
      !mrpType ||
      !minStock ||
      minStock === 0 ||
      !maxStock ||
      maxStock === 0 ||
      !categoryId ||
      !supplierId ||
      !minOrder ||
      minOrder === 0 ||
      !addressRackId
    ) {
      return res.status(400).json({
        message: "All fields are required, except packaging and unit packaging",
      });
    }

    const category = categoryId;
    const supplier = supplierId;
    const packaging = packagingId;
    const addressRack = addressRackId;

    // Cek materialNo
    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
      include: [
        {
          model: Inventory,
          required: true,
          attributes: ["id", "materialId", "addressId"],
        },
      ],
    });
    if (!material) {
      return res.status(400).json({ message: "Material not found" });
    }

    // Cek category
    const existCategory = await Category.findOne({
      where: { id: category.value, flag: 1 },
    });
    if (!existCategory) {
      return res.status(400).json({
        message:
          "Category not found, plese check it out first Category master data",
      });
    }

    // Cek supplier
    const existSupplier = await Supplier.findOne({
      where: { id: supplier.value, flag: 1 },
    });
    if (!existSupplier) {
      return res.status(400).json({
        message:
          "Supplier not found, please check it out first Supplier master data",
      });
    }

    if (packaging) {
      // Cek packaging
      const existPackaging = await Packaging.findOne({
        where: { id: packaging.value, flag: 1 },
      });
      if (!existPackaging) {
        return res.status(400).json({
          message:
            "Packaging not found, please check it out first Packaging master data",
        });
      }
    }

    // Cek address rack
    const existAddressRack = await AddressRack.findOne({
      where: { id: addressRack.value, flag: 1 },
    });
    if (!existAddressRack) {
      return res.status(400).json({
        message:
          "Address rack not found, please check it out first Address rack master data",
      });
    }

    // Cek materialStorage
    const materialStorage = await MaterialStorage.findOne({
      where: { materialId: materialId },
    });
    if (materialStorage) {
      await materialStorage.update(
        {
          storageId: existAddressRack.storageId,
        },
        {
          where: { materialId: materialId, flag: 1 },
          userId: req.user.userId,
          transaction,
        }
      );
    } else {
      // Hubungkan material dengan storage
      await MaterialStorage.create(
        {
          materialId: materialId,
          storageId: existAddressRack.storageId,
        },
        { userId: req.user.userId, transaction }
      );
    }

    // Update addressId jika ada perubahan
    if (material.Inventory.addressId !== addressRack.value) {
      await Inventory.update(
        { addressId: addressRack.value },
        { where: { id: material.Inventory.id }, transaction }
      );

      // Create log
      await LogEntry.create(
        {
          inventoryId: material.Inventory.id,
          typeLogEntry: "update address inventory",
          userId: req.user.userId,
        },
        { transaction }
      );
    }

    await Material.update(
      {
        description,
        uom: uom.value,
        price,
        type: type.value,
        mrpType: mrpType.value,
        minStock,
        maxStock,
        minOrder,
        packagingId: packaging?.value,
        categoryId: category.value,
        supplierId: supplier.value,
      },
      {
        where: {
          id: materialId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
        transaction,
      }
    );

    await transaction.commit();
    res.status(200).json({ message: "Material Updated" });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    await Material.update(
      { flag: 0 },
      {
        where: { id: materialId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Material deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addImage = async (req, res) => {
  try {
    const materialId = req.params.id;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const imagePath = `/uploads/products/${material.materialNo}${path.extname(
      image.originalname
    )}`;

    // Simpan path gambar ke database
    await Material.update(
      { img: imagePath },
      {
        where: {
          id: materialId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res
      .status(200)
      .json({ message: "Image upload successfully", imgPath: imagePath });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (!material.img) {
      return res.status(404).json({ message: "Image not found" });
    }

    const filePath = `./resources${material.img}`;

    // Periksa apakah file ada sebelum dihapus
    if (fs.existsSync(filePath)) {
      await fsp.unlink(filePath);
    } else {
      console.log("File not found:", filePath);
    }

    await Material.update(
      { img: null },
      {
        where: {
          id: materialId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInventoryMaterialAll = async (req, res) => {
  const limit = 1000; // Tentukan jumlah data per batch
  let offset = 0;
  let hasMoreData = true;
  let allData = []; // Variabel untuk menyimpan semua data

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0); // Mengatur waktu ke 00:00:00

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999); // Mengatur waktu ke 23:59:59

  try {
    while (hasMoreData) {
      // Mengambil data dalam batch
      const batchData = await Inventory.findAll({
        include: [
          {
            model: Material,
            where: { flag: 1 },
            include: [
              {
                model: Packaging,
                required: false,
                where: { flag: 1 },
              },
              {
                model: Category,
                required: false,
                where: { flag: 1 },
              },
              {
                model: Supplier,
                required: false,
                where: { flag: 1 },
              },
            ],
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
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: LogEntry,
            attributes: ["id", "userId", "createdAt", "updatedAt"],
            limit: 1,
            order: [["createdAt", "DESC"]],
            required: false,
            include: [
              {
                model: User,
                attributes: ["id", "username", "createdAt", "updatedAt"],
                where: { flag: 1 },
                required: false,
              },
            ],
          },
          // {
          //   model: Incoming,
          //   limit: 1,
          //   order: [["createdAt", "DESC"]],
          //   where: {
          //     createdAt: {
          //       [Op.between]: [startOfToday, endOfToday],
          //     },
          //   },
          // },
        ],
        limit,
        offset, // Mulai dari batch tertentu
      });

      // Tambahkan data batch ke allData
      allData = allData.concat(batchData);

      // Jika jumlah data yang diambil kurang dari limit, tidak ada lagi data yang tersisa
      if (batchData.length < limit) {
        hasMoreData = false;
      } else {
        offset += limit; // Tambahkan offset untuk batch berikutnya
      }
    }

    allData = allData.map((item) => {
      const material = item.Material;
      const addressRack = item.Address_Rack;
      const storage = addressRack.Storage;
      const plant = storage.Plant;

      const criticalMinStock = 1.5; // Faktor kritis untuk minStock dalam shift
      const overStock = 4.5; // Faktor untuk over minStock dalam shift

      const leadShift = item.quantityActualCheck
        ? Number(
            ((item.quantityActualCheck / material.minStock) * 2.5).toFixed(1)
          )
        : 0;

      const leadTime = item.quantityActualCheck
        ? Number(
            ((item.quantityActualCheck / material.minStock) * 20).toFixed(1)
          )
        : 0;

      let stockStatus = "Unknown";

      if (leadShift <= criticalMinStock) {
        stockStatus = "critical";
      } else if (leadShift > criticalMinStock && leadShift < overStock) {
        stockStatus = "normal";
      } else if (leadShift >= overStock) {
        stockStatus = "over";
      }

      return {
        id: item.id,
        materialNo: material.materialNo,
        description: material.description,
        addressRackName: addressRack.addressRackName,
        storageName: storage.storageName + " - " + storage.storageCode,
        supplier:
          material.Supplier.supplierName +
            " - " +
            material.Supplier.supplierCode || "No Supplier",
        plant: plant.plantName + " - " + plant.plantCode,
        warehouse:
          plant.Warehouse.warehouseName + " - " + plant.Warehouse.warehouseCode,
        packaging: material.Packaging ? material.Packaging.packagingName : null,
        packagingUnit: material.Packaging
          ? material.Packaging.unitPackaging
          : null,
        uom: material.uom,
        price: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(material.price),
        type: material.type,
        mrpType: material.mrpType,
        minStock: material.minStock,
        maxStock: material.maxStock,
        minOrder: material.minOrder,
        category: material.Category.categoryName,
        stock: item.quantityActualCheck,
        leadShift,
        leadTime,
        stockStatus: stockStatus,
        stockUpdatedAt: item.Log_Entries[0]
          ? formatDate(item.Log_Entries[0].createdAt)
          : null,
        stockUpdatedBy: item.Log_Entries[0]?.User
          ? item.Log_Entries[0].User.username
          : null,
      };
    });

    console.log(`Total data fetched: ${allData.length}`);

    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const limit = parseInt(req.query.limit, 10);
    let orderBy;

    if (status === "overflow") {
      orderBy = [
        [
          sequelize.literal(
            'ROUND((CAST("Inventory"."quantityActualCheck" AS FLOAT) / NULLIF(CAST("Material"."maxStock" AS FLOAT), 0)), 2)'
          ),
          "DESC", // overflow = nilai tertinggi di atas maxStock
        ],
      ];
    } else if (status === "critical") {
      orderBy = [
        [
          sequelize.literal(
            'ROUND((CAST("Inventory"."quantityActualCheck" AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0) * 2.5), 2)'
          ),
          "ASC",
        ],
      ];
    }

    const allData = await Inventory.findAll({
      include: [
        {
          model: Material,
          where: { flag: 1, type: "DIRECT" },
          include: [
            { model: Packaging, required: false, where: { flag: 1 } },
            { model: Category, required: false, where: { flag: 1 } },
            { model: Supplier, required: false, where: { flag: 1 } },
          ],
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
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: LogEntry,
          attributes: ["id", "userId", "createdAt", "updatedAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
          required: false,
          include: [
            {
              model: User,
              attributes: ["id", "username", "createdAt", "updatedAt"],
              where: { flag: 1 },
              required: false,
            },
          ],
        },
      ],
      order: orderBy,
      limit: limit,
    });

    const criticalMinStock = 1.5;
    const overStock = 4.5;

    const mappedData = allData.map((item) => {
      const material = item.Material;
      const addressRack = item.Address_Rack;
      const storage = addressRack.Storage;
      const plant = storage.Plant;

      const leadShift = item.quantityActualCheck
        ? Number(
            ((item.quantityActualCheck / material.minStock) * 2.5).toFixed(1)
          )
        : 0;

      const leadTime = item.quantityActualCheck
        ? Number(
            ((item.quantityActualCheck / material.minStock) * 20).toFixed(1)
          )
        : 0;

      let stockStatus = "Unknown";
      if (leadShift <= criticalMinStock) {
        stockStatus = "critical";
      } else if (leadShift < overStock) {
        stockStatus = "normal";
      } else if (leadShift >= overStock) {
        stockStatus = "over";
      }

      return {
        id: item.id,
        materialNo: material.materialNo,
        description: material.description,
        addressRackName: addressRack.addressRackName,
        storageName: `${storage.storageName} - ${storage.storageCode}`,
        supplier:
          material.Supplier?.supplierName +
            " - " +
            material.Supplier?.supplierCode || "No Supplier",
        plant: `${plant.plantName} - ${plant.plantCode}`,
        warehouse: `${plant.Warehouse?.warehouseName} - ${plant.Warehouse?.warehouseCode}`,
        packaging: material.Packaging?.packagingName || null,
        packagingUnit: material.Packaging?.unitPackaging || null,
        uom: material.uom,
        price: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(material.price),
        type: material.type,
        mrpType: material.mrpType,
        minStock: material.minStock,
        maxStock: material.maxStock,
        minOrder: material.minOrder,
        category: material.Category?.categoryName,
        stock: item.quantityActualCheck,
        leadShift,
        leadTime,
        stockStatus,
        stockUpdatedAt: item.Log_Entries?.[0]?.createdAt
          ? formatDate(item.Log_Entries[0].createdAt)
          : null,
        stockUpdatedBy: item.Log_Entries?.[0]?.User?.username || null,
      };
    });

    console.log(`Total data fetched: ${mappedData.length}`);

    res.status(200).json(mappedData);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};
