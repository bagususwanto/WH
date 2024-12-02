import express from "express";
import {
  uploadIncomingPlan,
  uploadIncomingActual,
  uploadMasterMaterial,
} from "../controllers/Excel.js";
import uploadFile from "../middleware/UploadMiddleware.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.post(
  "/upload-incoming-plan/:warehouseId",
  checkRole(["super admin", "warehouse member"]),
  checkUserWarehouse,
  uploadFile.single("file"),
  uploadIncomingPlan
);
router.post(
  "/upload-incoming-actual/:warehouseId",
  checkRole(["super admin", "warehouse member"]),
  checkUserWarehouse,
  uploadFile.single("file"),
  uploadIncomingActual
);
router.post(
  "/upload-master-material",
  checkRole(["super admin"]),
  uploadFile.single("file"),
  uploadMasterMaterial
);

export default router;
