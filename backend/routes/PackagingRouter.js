import express from "express";
import { getPackaging, getPackagingById, createPackaging, updatePackaging, deletePackaging } from "../controllers/Packaging.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/packaging", checkRole(["super admin"]), getPackaging);
router.get("/packaging-public", getPackaging);
router.get("/packaging/:id", checkRole(["super admin"]), getPackagingById);
router.post("/packaging", checkRole(["super admin"]), createPackaging);
router.put("/packaging/:id", checkRole(["super admin"]), updatePackaging);
router.get("/packaging-delete/:id", checkRole(["super admin"]), deletePackaging);

export default router;
