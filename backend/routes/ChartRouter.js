import express from "express";
import {
  getArrivalMonitoring,
  getDailyMaterialsArrive,
  getDnChartHistory,
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
router.get(
  "/dn-chart-history",
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
  getDnChartHistory
);
router.get(
  "/chart-material-arrive",
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
  getDailyMaterialsArrive
);

export default router;
