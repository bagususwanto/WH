import express from "express";
import { getCartItems, addToCart, updateCartItem, removeFromCart, countCartItems } from "../controllers/Cart.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get("/cart/:warehouseId", checkRole(["super admin", "group head", "line head", "section head", "department head"]), getCartItems);
router.post(
  "/cart/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  addToCart
);
router.put(
  "/cart/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  updateCartItem
);
router.delete(
  "/cart/:id/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  removeFromCart
);
router.get("/cart-count/:warehouseId", checkRole(["super admin", "group head", "line head", "section head", "department head"]), countCartItems);

export default router;
