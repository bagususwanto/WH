import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";

export const getStorage = async (req, res) => {
  try {
    const response = await Storage.findAll({
      where: { flag: 1 },
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
    const storageName = await Storage.findOne({ where: { storageName: req.body.storageName, flag: 1 } });

    if (storageName) {
      return res.status(400).json({ message: "Storage name already exists" });
    }

    await Storage.create(req.body);
    res.status(201).json({ message: "Storage Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStorage = async (req, res) => {
  try {
    const storageId = req.params.id;

    const storage = await Storage.findOne({
      where: { id: storageId, flag: 1 },
    });

    if (!storage) {
      return res.status(404).json({ message: "Storage not found" });
    }

    await Storage.update(req.body, {
      where: {
        id: storageId,
        flag: 1,
      },
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

    await Storage.update({ flag: 0 }, { where: { id: storageId, flag: 1 } });

    res.status(200).json({ message: "Storage deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
