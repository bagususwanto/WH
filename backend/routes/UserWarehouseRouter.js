import express from "express";
import {
  getUserWarehouse,
  createUserWarehouse,
  updateUserWarehouse,
  deleteUserWarehouse,
  getUserWarehouseByUserId,
} from "../controllers/UserWarehouse.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/user-warehouse", checkRole(["super admin"]), getUserWarehouse);
router.get("/warehouse-by-user", checkRole(["super admin"]), getUserWarehouseByUserId);
router.post("/user-warehouse", checkRole(["super admin"]), createUserWarehouse);
router.put("/user-warehouse/:id", checkRole(["super admin"]), updateUserWarehouse);
router.get("/user-warehouse-delete/:userId/:warehouseId", checkRole(["super admin"]), deleteUserWarehouse);

export default router;
