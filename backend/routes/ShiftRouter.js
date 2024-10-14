import express from "express";
import { getShift, getShiftById, createShift, updateShift, deleteShift } from "../controllers/Shift.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/shift", checkRole(["super admin"]), getShift);
router.get("/shift/:id", checkRole(["super admin"]), getShiftById);
router.post("/shift", checkRole(["super admin"]), createShift);
router.put("/shift/:id", checkRole(["super admin"]), updateShift);
router.get("/shift-delete/:id", checkRole(["super admin"]), deleteShift);

export default router;
