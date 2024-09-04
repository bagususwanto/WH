import express from "express";
import { getInventoryByHighCriticalStock } from "../controllers/Chart.js";

const router = express.Router();

router.get("/inventory-critical-stock", getInventoryByHighCriticalStock);

export default router;
