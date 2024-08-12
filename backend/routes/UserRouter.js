import express from "express";
import { getUser, getUserById, createUser, updateUser, deleteUser } from "../controllers/User.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/user", getUser);
router.get("/user/:id", getUserById);
router.post("/user", createUser);
router.put("/user/:id", updateUser);
router.get("/user-delete/:id", deleteUser);

export default router;
