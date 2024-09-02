import Plant from "../models/PlantModel.js";
import Shop from "../models/ShopModel.js";

export const getShop = async (req, res) => {
  try {
    const response = await Shop.findAll({
      where: { flag: 1 },
      attributes: ["id", "shopName", "createdAt", "updatedAt"],
      include: [
        {
          model: Plant,
          attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getShopById = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Shop.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    const response = await Shop.findOne({
      where: {
        id: shopId,
        flag: 1,
      },
      attributes: ["id", "shopName", "createdAt", "updatedAt"],
      include: [
        {
          model: Plant,
          attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getShopByPlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    const shop = await Shop.findOne({
      where: { plantId: plantId },
    });

    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
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
          attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createShop = async (req, res) => {
  try {
    const shopName = Shop.findOne({ where: { shopName: req.body.shopName } });

    if (shopName) {
      return res.status(400).json({ msg: "Shop name already exists" });
    }

    await Shop.create(req.body);
    res.status(201).json({ msg: "Shop Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Shop.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    await Shop.update(req.body, {
      where: {
        id: shopId,
      },
    });
    res.status(200).json({ msg: "Shop Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    const shop = await Shop.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    await Shop.update({ flag: 0 }, { where: { id: shopId } });

    res.status(200).json({ msg: "Shop deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
