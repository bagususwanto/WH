import express from "express";
import {
  getUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createUserAndOrg,
  updateUserAndOrg,
  addImage,
  deleteImage,
  getProfile,
  getStructureApproval,
  changePassword,
  getUseridsByOrganization,
} from "../controllers/User.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { uploadProfileImage } from "../middleware/UploadImageMiddleware.js";

const router = express.Router();

router.get("/user", checkRole(["super admin"]), getUser);
router.get("/user/:id", checkRole(["super admin"]), getUserById);
router.post("/user", checkRole(["super admin"]), createUser);
router.put("/user/:id", checkRole(["super admin"]), updateUser);
router.get("/user-delete/:id", checkRole(["super admin"]), deleteUser);
router.post("/user-org", checkRole(["super admin"]), createUserAndOrg);
router.put("/user-org/:id", checkRole(["super admin"]), updateUserAndOrg);
router.get("/user-public", getUser);
router.post(
  "/user-upload-image/:id",
  checkRole(["super admin"]),
  uploadProfileImage,
  addImage
);
router.put("/user-delete-image/:id", checkRole(["super admin"]), deleteImage);
router.get("/profile", getProfile);
router.get("/structure-approval", getStructureApproval);
router.post("/change-password", changePassword);
router.get("/user-organization", getUseridsByOrganization);

export default router;
