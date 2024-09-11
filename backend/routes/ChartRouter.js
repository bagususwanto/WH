import express from "express";
import { getInventoryDashboard } from "../controllers/Chart.js";

const router = express.Router();

router.get("/inventory-dashboard", getInventoryDashboard);

export default router;
