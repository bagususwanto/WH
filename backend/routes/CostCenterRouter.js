import express from "express";
import { getCostCenter, getCostCenterById, createCostCenter, updateCostCenter, deleteCostCenter } from "../controllers/CostCenter.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/cost-center", checkRole(["super admin"]), getCostCenter);
router.get("/cost-center/:id", checkRole(["super admin"]), getCostCenterById);
router.post("/cost-center", checkRole(["super admin"]), createCostCenter);
router.put("/cost-center/:id", checkRole(["super admin"]), updateCostCenter);
router.get("/cost-center-delete/:id", checkRole(["super admin"]), deleteCostCenter);

export default router;
