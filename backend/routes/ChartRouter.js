import express from "express";
import { getInventoryDashboard } from "../controllers/Chart.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/inventory-dashboard", checkRole(["super admin", "warehouse member", "warehouse staff"]), getInventoryDashboard);

export default router;
