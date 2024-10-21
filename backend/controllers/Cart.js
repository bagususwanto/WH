import AddressRack from "../models/AddressRackModel.js";
import Cart from "../models/CartModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Plant from "../models/PlantModel.js";
import Storage from "../models/StorageModel.js";

// Get all items in the cart for a user
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId; // Asumsikan user diambil dari middleware autentikasi
    const warehouseId = req.params.warehouseId;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Inventory,
          required: true,
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
                      where: { warehouseId: warehouseId, flag: 1 },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

// Add an item to the cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { inventoryId, quantity } = req.body;

    // Cari apakah item tersebut sudah ada di cart
    let cartItem = await Cart.findOne({
      where: { userId, inventoryId },
      include: [
        {
          model: Inventory,
          include: [
            {
              model: Material,
              where: { flag: 1 },
            },
          ],
        },
      ],
    });

    if (cartItem) {
      // Jika sudah ada, tambahkan quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Jika tidak ada, tambahkan item baru ke cart
      // Buat data Cart terlebih dahulu
      cartItem = await Cart.create({
        userId,
        inventoryId,
        quantity,
      });

      // Query untuk mendapatkan data Cart dengan includekan relasi Inventory dan Material
      cartItem = await Cart.findOne({
        where: { id: cartItem.id },
        include: [
          {
            model: Inventory,
            include: [
              {
                model: Material,
                where: { flag: 1 },
              },
            ],
          },
        ],
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

// Update item quantity in the cart
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { inventoryId, quantity } = req.body;

    const cartItem = await Cart.findOne({
      where: { inventoryId, userId },
      include: [
        {
          model: Inventory,
          include: [
            {
              model: Material,
              where: { flag: 1 },
            },
          ],
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item" });
  }
};

// Remove an item from the cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = req.params.id;

    const cartItem = await Cart.findOne({ where: { userId, id } });

    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};

// Count total items in the cart
export const countCartItems = async (req, res) => {
  try {
    const userId = req.user.userId; // Ambil userId dari autentikasi
    const warehouseId = req.params.warehouseId;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Inventory,
          required: true,
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
                      where: { warehouseId: warehouseId, flag: 1 },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    // Hitung total item (bukan quantity)
    const totalItems = cartItems.length;

    res.status(200).json({ totalItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to count cart items" });
  }
};
