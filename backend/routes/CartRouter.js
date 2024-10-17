import express from "express";
import { getCartItems, addToCart, updateCartItem, removeFromCart, countCartItems } from "../controllers/Cart.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/cart/:warehouseId", checkRole(["super admin"]), getCartItems);
router.post("/cart", checkRole(["super admin"]), addToCart);
router.put("/cart", checkRole(["super admin"]), updateCartItem);
router.delete("/cart-delete", checkRole(["super admin"]), removeFromCart);
router.get("/cart-count/:warehouseId", checkRole(["super admin"]), countCartItems);

export default router;
