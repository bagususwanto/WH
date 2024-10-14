import express from "express";
import { getGroup, getGroupById, createGroup, updateGroup, deleteGroup } from "../controllers/Group.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/group", checkRole(["super admin"]), getGroup);
router.get("/group/:id", checkRole(["super admin"]), getGroupById);
router.post("/group", checkRole(["super admin"]), createGroup);
router.put("/group/:id", checkRole(["super admin"]), updateGroup);
router.get("/group-delete/:id", checkRole(["super admin"]), deleteGroup);

export default router;
