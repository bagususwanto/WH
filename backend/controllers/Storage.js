import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";
import AddressRack from "../models/AddressRackModel.js";

export const getStorage = async (req, res) => {
  const { plantId } = req.query;

  let whereConditionPlant = { flag: 1 };

  if (plantId) {
    whereConditionPlant.id = plantId;
  }

  try {
    const response = await Storage.findAll({
      where: { flag: 1 },
      order: [["addressCode", "ASC"]],
      include: [
        {
          model: Plant,
          where: whereConditionPlant,
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Storage", action: "create" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
        {
          model: LogMaster,
          required: false,
          as: "updatedBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Storage" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
      ],
    });

    if (response.length === 0) {
      return res.status(404).json({ message: "Storage not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStorageById = async (req, res) => {
  try {
    const storageId = req.params.id;

    const storage = await Storage.findOne({
      where: { id: storageId, flag: 1 },
    });

    if (!storage) {
      return res.status(404).json({ message: "Storage not found" });
    }

    const response = await Storage.findOne({
      where: {
        id: storageId,
        flag: 1,
      },
      include: [
        {
          model: Plant,
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

export const getStorageByPlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    const storage = await Storage.findOne({
      where: { plantId: plantId, flag: 1 },
    });

    if (!storage) {
      return res.status(404).json({ message: "Storage not found" });
    }

    const response = await Storage.findAll({
      where: {
        plantId: plantId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createStorage = async (req, res) => {
  try {
    const { storageCode, storageName, plantId, addressCode } = req.body;
    if (!storageCode || !storageName || !plantId || !addressCode) {
      return res.status(400).json({
        message:
          "StorageCode, StorageName, AddressCode, and Plant are required",
      });
    }

    const storage = await Storage.findOne({
      where: {
        storageCode: storageCode,
        flag: 1,
      },
    });

    if (storage) {
      return res.status(400).json({ message: "Storage already exists" });
    }

    const storageRack = await Storage.findOne({
      where: {
        addressCode: addressCode,
        flag: 1,
      },
    });

    if (storageRack) {
      return res.status(400).json({ message: "Rack Code already exists" });
    }

    const plant = await Plant.findOne({
      where: { id: plantId.value, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    await Storage.create(
      {
        storageCode,
        storageName,
        plantId: plantId.value,
        addressCode,
      },
      { userId: req.user.userId }
    );

    res.status(201).json({ message: "Storage Created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStorage = async (req, res) => {
  try {
    const storageId = req.params.id;

    const { storageCode, plantId, addressCode } = req.body;

    const storage = await Storage.findOne({
      where: { id: storageId, flag: 1 },
    });

    if (!storage) {
      return res.status(404).json({ message: "Storage not found" });
    }

    const existingStorage = await Storage.findOne({
      where: {
        storageCode: storageCode,
      },
    });

    if (existingStorage) {
      return res.status(400).json({ message: "Storage already exists" });
    }

    const storageRack = await Storage.findOne({
      where: {
        addressCode: addressCode,
      },
    });

    if (storageRack) {
      return res.status(400).json({ message: "Rack Code already exists" });
    }

    await Storage.update(req.body, {
      where: {
        id: storageId,
        flag: 1,
      },
      individualHooks: true,
      userId: req.user.userId,
    });
    res.status(200).json({ message: "Storage Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStorage = async (req, res) => {
  try {
    const storageId = req.params.id;

    const storage = await Storage.findOne({
      where: { id: storageId, flag: 1 },
    });

    if (!storage) {
      return res.status(404).json({ message: "Storage not found" });
    }

    await Storage.update(
      { flag: 0 },
      {
        where: { id: storageId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Storage deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
