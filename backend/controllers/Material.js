import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Packaging from "../models/PackagingModel.js";
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";

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
    const materialNo = await Material.findOne({
      where: { materialNo: req.body.materialNo, flag: 1 },
    });

    if (materialNo) {
      return res.status(400).json({ message: "Material No. already exists" });
    }

    await Material.create(req.body);
    res.status(201).json({ message: "Material Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    await Material.update(req.body, {
      where: {
        id: materialId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Material Updated" });
  } catch (error) {
    console.log(error.message);
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
