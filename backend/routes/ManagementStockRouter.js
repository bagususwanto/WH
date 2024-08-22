import express from "express";
import { getInventory, updateInventory } from "../controllers/ManagementStock.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { authenticateUser } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/inventory", authenticateUser, getInventory);
router.put("/inventory/:id", authenticateUser, updateInventory);

export default router;
