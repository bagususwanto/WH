import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getRedpost } from "../controllers/Redpost.js";

const router = express.Router();

router.get("/redpost", getRedpost);

export default router;
