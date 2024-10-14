import Plant from "../models/PlantModel.js";
import Shop from "../models/ShopModel.js";

export const getShop = async (req, res) => {
  try {
    const response = await Shop.findAll({
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

export const getShopById = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Shop.findOne({
      where: { id: shopId, flag: 1 },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const response = await Shop.findOne({
      where: {
        id: shopId,
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

export const getShopByPlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    const shop = await Shop.findOne({
      where: { plantId: plantId, flag: 1 },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const response = await Shop.findAll({
      where: {
        plantId: plantId,
        flag: 1,
      },
      attributes: ["id", "shopName", "createdAt", "updatedAt"],
      include: [
        {
          model: Plant,
          where: { flag: 1 },
          attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createShop = async (req, res) => {
  try {
    const shopName = await Shop.findOne({ where: { shopName: req.body.shopName, flag: 1 } });

    if (shopName) {
      return res.status(400).json({ message: "Shop name already exists" });
    }

    await Shop.create(req.body);
    res.status(201).json({ message: "Shop Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Shop.findOne({
      where: { id: shopId, flag: 1 },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    await Shop.update(req.body, {
      where: {
        id: shopId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Shop Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Shop.findOne({
      where: { id: shopId, flag: 1 },
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    await Shop.update({ flag: 0 }, { where: { id: shopId, flag: 1 } });

    res.status(200).json({ message: "Shop deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
