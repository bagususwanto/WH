import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkout } from "../controllers/Order.js";

const router = express.Router();

router.post("/checkout", checkRole(["super admin"]), checkout);

export default router;
