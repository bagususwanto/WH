import Storage from "../models/StorageModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getStorage = async (req, res) => {
  try {
    const response = await Storage.findAll({
      where: { flag: 1 },
      attributes: ["id", "storageName", "createdAt", "updatedAt"],
      include: [
        {
          model: Shop,
          attributes: ["id", "shopName", "createdAt", "updatedAt"],
          include: [
            {
              model: Plant,
              attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
            },
          ],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getStorageById = async (req, res) => {
  try {
    const storageId = req.params.id;

    const storage = await Storage.findOne({
      where: { id: storageId },
    });

    if (!storage) {
      return res.status(404).json({ msg: "Storage not found" });
    }

    const response = await Storage.findOne({
      where: {
        id: storageId,
        flag: 1,
      },
      attributes: ["id", "storageName", "createdAt", "updatedAt"],
      include: [
        {
          model: Shop,
          attributes: ["id", "shopName", "createdAt", "updatedAt"],
          include: [
            {
              model: Plant,
              attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
            },
          ],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getStorageByShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Storage.findOne({
      where: { shopId: shopId },
    });

    if (!shop) {
      return res.status(404).json({ msg: "Storage not found" });
    }

    const response = await Storage.findAll({
      where: {
        shopId: shopId,
        flag: 1,
      },
      attributes: ["id", "storageName", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createStorage = async (req, res) => {
  try {
    const storageName = Storage.findOne({ where: { storageName: req.body.storageName } });

    if (storageName) {
      return res.status(400).json({ msg: "Storage name already exists" });
    }

    await Storage.create(req.body);
    res.status(201).json({ msg: "Storage Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateStorage = async (req, res) => {
  try {
    const storageId = req.params.id;

    const storage = await Storage.findOne({
      where: { id: storageId },
    });

    if (!storage) {
      return res.status(404).json({ msg: "Storage not found" });
    }

    await Storage.update(req.body, {
      where: {
        id: storageId,
      },
    });
    res.status(200).json({ msg: "Storage Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteStorage = async (req, res) => {
  try {
    const storageId = req.params.id;

    const storage = await Storage.findOne({
      where: { id: storageId },
    });

    if (!storage) {
      return res.status(404).json({ msg: "Storage not found" });
    }

    await Storage.update({ flag: 0 }, { where: { id: storageId } });

    res.status(200).json({ msg: "Storage deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
