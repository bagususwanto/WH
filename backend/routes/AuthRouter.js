import express from "express";
import { login, logout, refreshToken } from "../controllers/Auth.js";

const router = express.Router();

router.post("/login", login);
router.delete("/logout", logout);
router.get("/token", refreshToken);

export default router;
