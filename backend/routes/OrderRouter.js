import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkout, createOrder } from "../controllers/Order.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.post(
  "/checkout/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  checkout
);
router.post(
  "/order/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  createOrder
);

export default router;
