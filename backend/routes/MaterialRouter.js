import express from "express";
import { getMaterial, getMaterialById, getMaterialIdByMaterialNo, createMaterial, updateMaterial, deleteMaterial } from "../controllers/Material.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/material", getMaterial);
router.get("/material/:id", getMaterialById);
router.get("/materialid/:materialno", getMaterialIdByMaterialNo);
router.post("/material", createMaterial);
router.put("/material/:id", updateMaterial);
router.get("/material-delete/:id", deleteMaterial);

export default router;
