import express from "express";
import { login, logout } from "../controllers/Auth.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.post("/login", login);
router.delete("/logout", logout);
router.get("/token", refreshToken);

export default router;
