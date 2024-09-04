import express from "express";
import { getMaterial, getMaterialById, getMaterialIdByMaterialNo, createMaterial, updateMaterial, deleteMaterial } from "../controllers/Material.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/material", checkRole(["super admin"]), getMaterial);
router.get("/material/:id", checkRole(["super admin"]), getMaterialById);
router.get("/materialid/:materialno", checkRole(["super admin"]), getMaterialIdByMaterialNo);
router.post("/material", checkRole(["super admin"]), createMaterial);
router.put("/material/:id", checkRole(["super admin"]), updateMaterial);
router.get("/material-delete/:id", checkRole(["super admin"]), deleteMaterial);

export default router;
