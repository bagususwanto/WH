import express from "express";
import { getPlant, getPlantById, createPlant, updatePlant, deletePlant } from "../controllers/Plant.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/plant", getPlant);
router.get("/plant/:id", getPlantById);
router.post("/plant", createPlant);
router.put("/plant/:id", updatePlant);
router.get("/plant-delete/:id", deletePlant);

export default router;
