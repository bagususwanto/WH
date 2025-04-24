import express from "express";
import {
  getArrivalMonitoring,
  getInventoryDashboard,
} from "../controllers/Chart.js";
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
router.get(
  "/arrival-monitoring",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  getArrivalMonitoring
);

export default router;
