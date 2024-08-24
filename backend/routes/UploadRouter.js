import express from "express";
import { uploadIncomingPlan } from "../controllers/Excel.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import uploadFile from "../middleware/UploadMiddleware.js";

const router = express.Router();

router.post("/upload-incoming-plan", uploadFile.single("file"), uploadIncomingPlan);

export default router;
