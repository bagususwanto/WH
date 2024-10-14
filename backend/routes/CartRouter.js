import express from "express";
import { getCartItems, addToCart, updateCartItem, removeFromCart } from "../controllers/Cart.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/cart", checkRole(["super admin"]), getCartItems);
router.post("/cart", checkRole(["super admin"]), addToCart);
router.put("/cart", checkRole(["super admin"]), updateCartItem);
router.get("/cart-delete", checkRole(["super admin"]), removeFromCart);

export default router;
