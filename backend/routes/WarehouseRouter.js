import express from "express";
import {
  getWarehouse,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseByUser,
  getWarehouseByPlantId,
} from "../controllers/Warehouse.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/warehouse", checkRole(["super admin"]), getWarehouse);
router.get("/warehouse-public", getWarehouse);
router.get("/warehouse/:id", checkRole(["super admin"]), getWarehouseById);
router.post("/warehouse", checkRole(["super admin"]), createWarehouse);
router.put("/warehouse/:id", checkRole(["super admin"]), updateWarehouse);
router.get("/warehouse-delete/:id", checkRole(["super admin"]), deleteWarehouse);
router.get("/warehouse-user", getWarehouseByUser);
router.get("/warehouse-plant/:plantId", getWarehouseByPlantId);

export default router;
