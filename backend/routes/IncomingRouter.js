import express from "express";
import { getIncoming } from "../controllers/Incoming.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/incoming", getIncoming);

export default router;
