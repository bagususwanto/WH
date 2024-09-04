import express from "express";
import { uploadIncomingPlan, uploadIncomingActual, uploadMasterMaterial } from "../controllers/Excel.js";
import uploadFile from "../middleware/UploadMiddleware.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.post("/upload-incoming-plan", checkRole(["super admin", "warehouse staff"]), uploadFile.single("file"), uploadIncomingPlan);
router.post("/upload-incoming-actual", checkRole(["super admin", "warehouse staff"]), uploadFile.single("file"), uploadIncomingActual);
router.post("/upload-master-material", checkRole(["super admin", "warehouse staff"]), uploadFile.single("file"), uploadMasterMaterial);

export default router;
