import express from "express";
import { getUser, getUserById, createUser, updateUser, deleteUser } from "../controllers/User.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/user", checkRole(["super admin"]), getUser);
router.get("/user/:id", checkRole(["super admin"]), getUserById);
router.post("/user", checkRole(["super admin"]), createUser);
router.put("/user/:id", checkRole(["super admin"]), updateUser);
router.get("/user-delete/:id", checkRole(["super admin"]), deleteUser);

export default router;
