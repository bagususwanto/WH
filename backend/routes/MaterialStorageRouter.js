import express from "express";
import {
  getMaterialStorage,
  createMaterialStorage,
  updateMaterialStorage,
  deleteMaterialStorage,
} from "../controllers/MaterialStorage.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/material-storage", checkRole(["super admin"]), getMaterialStorage);
router.post(
  "/material-storage",
  checkRole(["super admin"]),
  createMaterialStorage
);
router.put(
  "/material-storage/:id",
  checkRole(["super admin"]),
  updateMaterialStorage
);
router.get(
  "/material-storage-delete/:userId/:warehouseId",
  checkRole(["super admin"]),
  deleteMaterialStorage
);

export default router;
