import express from "express";
import { getRole, getRoleById, createRole, updateRole, deleteRole } from "../controllers/Role.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/role", getRole);
router.get("/role/:id", getRoleById);
router.post("/role", createRole);
router.put("/role/:id", updateRole);
router.get("/role-delete/:id", deleteRole);

export default router;
