import express from "express";
import { getOrderApproval } from "../controllers/Approval.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get("/approval", checkRole(["super admin", "line head", "section head", "department head"]), getOrderApproval);

export default router;
