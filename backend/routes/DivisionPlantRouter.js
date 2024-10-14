import express from "express";
import {
  getDivisionPlant,
  getDivisionPlantByDivisionId,
  createDivisionPlant,
  updateDivisionPlant,
  deleteDivisionPlant,
} from "../controllers/DivisionPlant.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/division-plant", checkRole(["super admin"]), getDivisionPlant);
router.get("/division-plant/:id", checkRole(["super admin"]), getDivisionPlantByDivisionId);
router.post("/division-plant", checkRole(["super admin"]), createDivisionPlant);
router.put("/division-plant/:id", checkRole(["super admin"]), updateDivisionPlant);
router.get("/division-plant-delete/:divisionId/plantId", checkRole(["super admin"]), deleteDivisionPlant);

export default router;
