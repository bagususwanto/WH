import express from "express";
import {
  login,
  logout,
  refreshToken,
  verifyTokenAccess,
} from "../controllers/Auth.js";
import { checkValidasiUserWH } from "../controllers/Auth.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { changePassword } from "../controllers/User.js";

const router = express.Router();

router.post("/login", login);
router.delete("/logout", logout);
router.get("/token", refreshToken);
router.post("/reset-password", changePassword);
router.get("/check-warehouse/:warehouseId", verifyToken, checkValidasiUserWH);
router.post("/verify", verifyTokenAccess);

export default router;
