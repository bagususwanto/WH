import express from "express";
import { getMaterialPlant, getMaterialPlantByPlantId, createMaterialPlant, updateMaterialPlant, deleteMaterialPlant } from "../controllers/MaterialPlant.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/material-plant", checkRole(["super admin"]), getMaterialPlant);
router.get("/material-plant/:id", checkRole(["super admin"]), getMaterialPlantByPlantId);
router.post("/material-plant", checkRole(["super admin"]), createMaterialPlant);
router.put("/material-plant/:id", checkRole(["super admin"]), updateMaterialPlant);
router.get("/material-plant-delete/:materialId/:plantId", checkRole(["super admin"]), deleteMaterialPlant);

export default router;
