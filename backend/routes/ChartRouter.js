import express from "express";
import { getInventoryDashboard } from "../controllers/Chart.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get(
  "/inventory-dashboard",
  checkRole(
    [
      "super admin",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  getInventoryDashboard
);

export default router;
