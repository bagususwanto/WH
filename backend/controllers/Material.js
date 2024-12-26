import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Packaging from "../models/PackagingModel.js";
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";
import MaterialStorage from "../models/MaterialStorageModel.js";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export const getMaterial = async (req, res) => {
  try {
    let response = [];
    let offset = 0;
    const limit = 1000;
    let batch;
    const { storageId, plantId, type } = req.query;

    let whereCondition = { flag: 1 };
    let whereConditionStorage = { flag: 1 };
    let whereConditionPlant = { flag: 1 };

    if (type) {
      whereCondition.type = type;
    }

    if (storageId) {
      whereConditionStorage.id = storageId;
    }

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    do {
      // Fetch a batch of 1000 records
      batch = await Material.findAll({
        limit,
        offset,
        where: whereCondition,
        subQuery: false,
        include: [
          {
            model: Packaging,
            required: false,
            where: { flag: 1 },
          },
          {
            model: Category,
            where: { flag: 1 },
          },
          {
            model: Supplier,
            required: false,
            where: { flag: 1 },
          },
          {
            model: Storage,
            where: whereConditionStorage,
            required: true,
            include: [
              {
                model: Plant,
                where: whereConditionPlant,
                required: true,
              },
            ],
          },
        ],
      });

      // Add the batch to the response array
      response = response.concat(batch);

      // Update offset for the next batch
      offset += limit;
    } while (batch.length === limit); // Continue fetching until we get less than 1000 records

    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Materials not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
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
      packaging,
      unitPackaging,
      minOrder,
      storageId,
      plantId,
    } = req.body;

    // Validasi data tersedia
    if (
      !materialNo ||
      !description ||
      !uom ||
      !price ||
      price === 0 ||
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
      !storageId ||
      !plantId
    ) {
      return res.status(400).json({
        message: "All fields are required, except packaging and unit packaging",
      });
    }

    if (packaging && !unitPackaging) {
      return res.status(400).json({ message: "Unit Packaging is required" });
    }

    if (!packaging && unitPackaging) {
      return res.status(400).json({ message: "Packaging is required" });
    }

    // Cek packaging
    let packagingRes = null;
    if (packaging && unitPackaging) {
      const existPackaging = await Packaging.findOne({
        where: {
          packaging: packaging.value,
          unitPackaging: unitPackaging,
          flag: 1,
        },
      });

      if (!existPackaging) {
        packagingRes = await Packaging.create({
          packaging: packaging.value,
          unitPackaging: unitPackaging,
        });
      } else {
        packagingRes = existPackaging;
      }
    }

    // Cek storageId dan plantId
    const storagePlant = await Storage.findOne({
      where: { id: storageId.id, plantId: plantId.id, flag: 1 },
    });
    if (!storagePlant) {
      return res.status(400).json({
        message: "Storage or Plant not found, please check storage and plant",
      });
    }

    // Buat material baru
    const newMaterial = await Material.create({
      materialNo,
      description,
      uom: uom.value,
      price,
      type: type.value,
      mrpType: mrpType.value,
      minStock,
      maxStock,
      categoryId: categoryId.id,
      supplierId: supplierId.id,
      packagingId: packagingRes?.id,
      minOrder,
    });

    // Hubungkan material dengan storage
    await MaterialStorage.create({
      materialId: newMaterial.id,
      storageId: storageId.id,
    });

    res
      .status(201)
      .json({ message: "Material Created", material: newMaterial });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterial = async (req, res) => {
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
      packaging,
      unitPackaging,
      minOrder,
      storageId,
      plantId,
    } = req.body;

    // validasi data tersedia
    if (
      !description ||
      !uom ||
      !price ||
      price === 0 ||
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
      !storageId ||
      !plantId
    ) {
      return res.status(400).json({
        message: "All fields are required, except packaging and unit packaging",
      });
    }

    if (packaging && !unitPackaging) {
      return res.status(400).json({ message: "Unit Packaging is required" });
    }

    if (!packaging && unitPackaging) {
      return res.status(400).json({ message: "Packaging is required" });
    }

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    let packagingRes = null;
    // Cek packaging
    if (packaging && unitPackaging) {
      const existPackaging = await Packaging.findOne({
        where: {
          packaging: packaging.value,
          unitPackaging: unitPackaging,
          flag: 1,
        },
      });

      if (!existPackaging) {
        packagingRes = await Packaging.create({
          packaging: packaging.value,
          unitPackaging: unitPackaging,
        });
      } else {
        packagingRes = existPackaging;
      }
    }

    // Cek storageId dan plantId
    const storagePlant = await Storage.findOne({
      where: { id: storageId.id, plantId: plantId.id, flag: 1 },
    });
    if (!storagePlant) {
      return res.status(400).json({
        message: "Storage or Plant not found, please check storage and plant",
      });
    }

    // Cek materialId dan storageId
    const materialStorage = await MaterialStorage.findOne({
      where: { materialId: materialId, storageId: storageId.id, flag: 1 },
    });
    if (!materialStorage) {
      MaterialStorage.create({
        materialId: materialId,
        storageId: storageId.id,
      });
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
        categoryId: categoryId.id,
        supplierId: supplierId.id,
        packagingId: packagingRes?.id,
        minOrder,
      },
      {
        where: {
          id: materialId,
          flag: 1,
        },
      }
    );
    res.status(200).json({ message: "Material Updated" });
  } catch (error) {
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

    await Material.update({ flag: 0 }, { where: { id: materialId, flag: 1 } });

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
      }
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
