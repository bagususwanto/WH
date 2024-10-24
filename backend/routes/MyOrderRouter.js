import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getMyOrder } from "../controllers/MyOrder.js";

const router = express.Router();

router.get("/myorder/:warehouseId", checkRole(["super admin", "group head", "line head", "section head", "department head"]), getMyOrder);

export default router;
