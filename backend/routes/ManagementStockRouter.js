import express from "express";
import { getInventory, updateIncoming, updateInventory } from "../controllers/ManagementStock.js";

const router = express.Router();

router.get("/inventory", getInventory);
router.put("/inventory/:id", updateInventory);
router.put("/incoming/:id", updateIncoming);

export default router;
