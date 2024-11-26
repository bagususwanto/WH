import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getOrderHistory } from "../controllers/OrderHistory.js";

const router = express.Router();

router.get(
  "/order-history/:orderId",
  checkRole([
    "super admin",
    "group head",
    "line head",
    "section head",
    "department head",
    "warehouse staff",
    "warehouse member",
  ]),
  getOrderHistory
);

export default router;
