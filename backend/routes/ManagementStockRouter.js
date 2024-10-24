import express from "express";
import { getInventory, updateIncoming, updateInventory, executeInventory, getAllInventory, submitInventory } from "../controllers/ManagementStock.js";

const router = express.Router();

router.get("/inventory/:storageId", getInventory);
router.put("/inventory/:id", updateInventory);
router.put("/incoming/:id", updateIncoming);
router.get("/inventory-execute", executeInventory);
router.get("/inventory-all", getAllInventory);
router.post("/inventory-submit", submitInventory);

export default router;
