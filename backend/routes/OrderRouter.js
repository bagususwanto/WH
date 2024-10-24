import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkout, createOrder } from "../controllers/Order.js";

const router = express.Router();

router.post("/checkout", checkRole(["super admin", "group head", "line head", "section head", "department head"]), checkout);
router.post("/order", checkRole(["super admin", "group head", "line head", "section head", "department head"]), createOrder);

export default router;
