import express from "express";
import {
  getInventoryMaterialAll,
  getInventoryByStatus,
} from "../controllers/Material.js";

const router = express.Router();

router.get("/inventory-material-all", getInventoryMaterialAll);
router.get("/inventory-status", getInventoryByStatus);
export default router;
