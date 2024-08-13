import express from "express";
import { getInventory, updateInventory } from "../controllers/ManagementStock.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/inventory", getInventory);
router.put("/inventory/:id", updateInventory);

export default router;
