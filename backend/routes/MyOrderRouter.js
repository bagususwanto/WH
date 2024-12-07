import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getMyOrder } from "../controllers/MyOrder.js";

const router = express.Router();

router.get(
  "/myorder/:warehouseId",
  getMyOrder
);

export default router;
