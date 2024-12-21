import express from "express";
import {
  getDivision,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
} from "../controllers/Division.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/division", checkRole(["super admin"]), getDivision);
router.get("/division/:id", checkRole(["super admin"]), getDivisionById);
router.post("/division", checkRole(["super admin"]), createDivision);
router.put("/division/:id", checkRole(["super admin"]), updateDivision);
router.get("/division-delete/:id", checkRole(["super admin"]), deleteDivision);
router.get("/division-public", getDivision);

export default router;
