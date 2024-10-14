import express from "express";
import { getOrganization, getOrganizationById, createOrganization, updateOrganization, deleteOrganization } from "../controllers/Organization.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/organization", checkRole(["super admin"]), getOrganization);
router.get("/organization/:id", checkRole(["super admin"]), getOrganizationById);
router.post("/organization", checkRole(["super admin"]), createOrganization);
router.put("/organization/:id", checkRole(["super admin"]), updateOrganization);
router.get("/organization-delete/:id", checkRole(["super admin"]), deleteOrganization);

export default router;
