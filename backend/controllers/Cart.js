import Cart from "../models/CartModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";

// Get all items in the cart for a user
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId; // Asumsikan user diambil dari middleware autentikasi
    const cartItems = await Cart.findAll({
      where: { userId },
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

    if (cartItems.length === 0) {
      return res.status(404).json({ error: "Cart items not found" });
    }

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
      cartItem = await Cart.create({
        userId,
        inventoryId,
        quantity,
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
    const { inventoryId } = req.body;

    const cartItem = await Cart.findOne({ where: { userId, inventoryId } });

    if (!cartItem) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};
