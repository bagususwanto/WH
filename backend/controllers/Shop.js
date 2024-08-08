import Users from "../models/UserModel.js";
import Shop from "../models/shopModel.js";

export const getShops = async (req, res) => {
  try {
    const shop = await Shop.findAll();
    return res.status(200).json(shop);
  } catch (error) {
    console.error("Error fetching shop:", error);
    return res.status(500).json({ message: "Failed to fetch shop", error: error.message });
  }
};

export const addShop = async (req, res) => {
  try {
    const { shopCode, shopName, wbsNumber, costCenter, createdBy, updateBy } = req.body;

    await Shop.create({
      shopCode,
      shopName,
      wbsNumber,
      costCenter,
      createdBy,
      updateBy,
    });
    res.json({ msg: "Berhasil menambahkan data shop" });

    // Kembalikan respons sukses
    return res.status(201).json(newShop);
  } catch (error) {
    console.error("Error adding shop:", error);
    return res.status(500).json({ message: "Failed to add shop", error: error.message });
  }
};
