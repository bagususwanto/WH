import express from "express";
import { getUser, getUserById, createUser, updateUser, deleteUser } from "../controllers/User.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { authenticateUser } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/user", verifyToken, checkRole([1]), getUser);
router.get("/user/:id", getUserById);
router.post("/user", createUser);
router.put("/user/:id", updateUser);
router.get("/user-delete/:id", deleteUser);

export default router;
