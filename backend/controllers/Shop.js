import Shop from "../models/ShopModel.js";

export const getShop = async (req, res) => {
  try {
    const response = await Shop.findAll({
      where: { flag: 1 },
      attributes: ["id", "shopName", "costCenter", "wbsNumber", "plantId", "ext", "createdAt", "updatedAt"],
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
      attributes: ["id", "shopName", "costCenter", "wbsNumber", "plantId", "ext", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createShop = async (req, res) => {
  try {
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
