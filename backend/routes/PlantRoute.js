import express from "express";
import { getPlant, getPlantById, createPlant, updatePlant, deletePlant } from "../controllers/Plant.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/plant", checkRole(["super admin"]), getPlant);
router.get("/plant-public", getPlant);
router.get("/plant/:id", checkRole(["super admin"]), getPlantById);
router.post("/plant", checkRole(["super admin"]), createPlant);
router.put("/plant/:id", checkRole(["super admin"]), updatePlant);
router.get("/plant-delete/:id", checkRole(["super admin"]), deletePlant);

export default router;
