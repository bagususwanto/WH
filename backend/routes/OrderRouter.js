import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkout, createOrder } from "../controllers/Order.js";

const router = express.Router();

router.post("/checkout", checkRole(["super admin"]), checkout);
router.post("/order", checkRole(["super admin"]), createOrder);

export default router;
