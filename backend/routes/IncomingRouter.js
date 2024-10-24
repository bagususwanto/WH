import express from "express";
import { getIncoming } from "../controllers/Incoming.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { cancelIncomingPlan } from "../controllers/Excel.js";

const router = express.Router();

router.get("/incoming", checkRole(["super admin", "warehouse member"]), getIncoming);
router.get("/incoming-plan-cancel/:id", cancelIncomingPlan);

export default router;
