import express from "express";
import { getInventory, updateIncoming, updateInventory, executeInventory } from "../controllers/ManagementStock.js";

const router = express.Router();

router.get("/inventory", getInventory);
router.put("/inventory/:id", updateInventory);
router.put("/incoming/:id", updateIncoming);
router.get("/inventory-execute", executeInventory);

export default router;
