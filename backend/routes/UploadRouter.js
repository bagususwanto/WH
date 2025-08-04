import express from "express";
import {
  uploadIncomingPlan,
  uploadIncomingActual,
  uploadMasterMaterial,
  uploadMasterAddress,
  uploadDeliveryNote,
  uploadMasterDeliverySchedule,
  uploadMappingMaterialAddress,
  uploadStockIWMS,
  uploadUserHR,
} from "../controllers/Excel.js";
import uploadFile from "../middleware/UploadMiddleware.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.post(
  "/upload-incoming-plan/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  uploadFile.single("file"),
  uploadIncomingPlan
);
router.post(
  "/upload-incoming-actual/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
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
router.post(
  "/upload-master-address",
  checkRole(["super admin"]),
  uploadFile.single("file"),
  uploadMasterAddress
);
router.post(
  "/upload-delivery-note/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  uploadFile.single("file"),
  uploadDeliveryNote
);
router.post(
  "/upload-delivery-schedule/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  uploadFile.single("file"),
  uploadMasterDeliverySchedule
);
router.post(
  "/upload-mapping-material-address",
  checkRole(["super admin"]),
  uploadFile.single("file"),
  uploadMappingMaterialAddress
);
router.post(
  "/upload-soh/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  uploadFile.single("file"),
  uploadStockIWMS
);
router.post(
  "/upload-master-user",
  checkRole(["super admin"]),
  uploadFile.single("file"),
  uploadUserHR
);

export default router;
