import express from "express";
import { getRole, getRoleById, createRole, updateRole, deleteRole } from "../controllers/Role.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/role", checkRole(["super admin"]), getRole);
router.get("/role/:id", checkRole(["super admin"]), getRoleById);
router.post("/role", checkRole(["super admin"]), createRole);
router.put("/role/:id", checkRole(["super admin"]), updateRole);
router.get("/role-delete/:id", checkRole(["super admin"]), deleteRole);

export default router;
