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
