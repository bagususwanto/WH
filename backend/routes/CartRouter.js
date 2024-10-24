import express from "express";
import { getCartItems, addToCart, updateCartItem, removeFromCart, countCartItems } from "../controllers/Cart.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/cart/:warehouseId", checkRole(["super admin", "group head", "line head", "section head", "department head"]), getCartItems);
router.post("/cart", checkRole(["super admin", "group head", "line head", "section head", "department head"]), addToCart);
router.put("/cart", checkRole(["super admin", "group head", "line head", "section head", "department head"]), updateCartItem);
router.delete("/cart/:id", checkRole(["super admin", "group head", "line head", "section head", "department head"]), removeFromCart);
router.get("/cart-count/:warehouseId", checkRole(["super admin", "group head", "line head", "section head", "department head"]), countCartItems);

export default router;
