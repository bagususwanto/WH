import express from "express";
import { getOrderApproval } from "../controllers/Approval.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/approval", checkRole(["super admin", "line head"]), getOrderApproval);

export default router;
