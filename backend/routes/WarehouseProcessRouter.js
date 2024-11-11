import express from "express";
import { getOrderWarehouse, processOrder, shopingOrder, completeOrder, rejectOrderWarehouse } from "../controllers/WarehouseProcess.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get("/list-orders/:warehouseId", checkRole(["super admin", "warehouse member", "warehouse staff"]), checkUserWarehouse, getOrderWarehouse);
router.post("/warehouse-process/:warehouseId", checkRole(["super admin", "warehouse staff"]), checkUserWarehouse, processOrder);
router.post("/shoping-order/:warehouseId", checkRole(["super admin", "warehouse member"]), checkUserWarehouse, shopingOrder);
router.post("/complete-order/:warehouseId", checkRole(["super admin", "warehouse member"]), checkUserWarehouse, completeOrder);
router.post("/reject-order/:warehouseId", checkRole(["super admin", "warehouse staff"]), checkUserWarehouse, rejectOrderWarehouse);

export default router;
