import express from "express";
import { getCostCenter, getCostCenterById, createCostCenter, updateCostCenter, deleteCostCenter } from "../controllers/CostCenter.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/cost-center", getCostCenter);
router.get("/cost-center/:id", getCostCenterById);
router.post("/cost-center", createCostCenter);
router.put("/cost-center/:id", updateCostCenter);
router.get("/cost-center-delete/:id", deleteCostCenter);

export default router;
