import express from "express";
import {
  getMaterial,
  getMaterialById,
  getMaterialIdByMaterialNo,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addImage,
  deleteImage,
} from "../controllers/Material.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import uploadImage from "../middleware/UploadImageMiddleware.js";

const router = express.Router();

router.get("/material", checkRole(["super admin"]), getMaterial);
router.get("/material/:id", checkRole(["super admin"]), getMaterialById);
router.get(
  "/materialid/:materialno",
  checkRole(["super admin"]),
  getMaterialIdByMaterialNo
);
router.post("/material", checkRole(["super admin"]), createMaterial);
router.put("/material/:id", checkRole(["super admin"]), updateMaterial);
router.get("/material-delete/:id", checkRole(["super admin"]), deleteMaterial);
router.post(
  "/material-upload-image/:id",
  checkRole(["super admin"]),
  uploadImage.single("image"),
  addImage
);
router.put(
  "/material-delete-image/:id",
  checkRole(["super admin"]),
  deleteImage
);
export default router;
