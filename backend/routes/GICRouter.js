import express from "express";
import { getGIC, getGICById, createGIC, updateGIC, deleteGIC } from "../controllers/GIC.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/gic", checkRole(["super admin"]), getGIC);
router.get("/gic/:id", checkRole(["super admin"]), getGICById);
router.post("/gic", checkRole(["super admin"]), createGIC);
router.put("/gic/:id", checkRole(["super admin"]), updateGIC);
router.get("/gic-delete/:id", checkRole(["super admin"]), deleteGIC);

export default router;
