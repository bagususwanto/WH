import Wishlist from "../models/WishlistModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";

// Menambahkan inventory ke wishlist
export const addToWishlist = async (req, res) => {
  try {
    const inventoryId = req.body.inventoryId;
    const userId = req.user.userId;

    // Cek jika inventory sudah ada di wishlist
    const existingWishlist = await Wishlist.findOne({
      where: {
        userId,
        inventoryId,
      },
    });

    if (existingWishlist) {
      return res.status(400).json({ message: "Inventory already in wishlist." });
    }

    // Tambahkan inventory ke wishlist
    const wishlist = await Wishlist.create({ userId, inventoryId });
    return res.status(201).json({ message: "Inventory added to wishlist.", wishlist });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Mengambil semua wishlist user tertentu
export const getWishlistByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Inventory,
          include: [
            {
              model: Material,
              where: { flag: 1 },
            },
            {
              model: AddressRack,
              where: { flag: 1 },
              include: [
                {
                  model: Storage,
                  where: { flag: 1 },
                  include: [
                    {
                      model: Plant,
                      where: { flag: 1 },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Menghapus inventory dari wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const inventoryId = req.params;
    const userId = req.user.userId;

    const wishlist = await Wishlist.findOne({
      where: {
        userId,
        inventoryId,
      },
    });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    await Wishlist.destroy({
      where: {
        userId,
        inventoryId,
      },
    });

    return res.status(200).json({ message: "Inventory removed from wishlist." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Menghapus semua wishlist untuk user tertentu
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Wishlist.destroy({
      where: { userId },
    });

    return res.status(200).json({ message: "Wishlist cleared." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
