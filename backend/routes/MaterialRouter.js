import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import { getMaterials, addMaterial } from "../controllers/Material.js";

const router = express.Router();

router.get("/materials", getMaterials);
router.post("/materials", addMaterial);

export default router;
