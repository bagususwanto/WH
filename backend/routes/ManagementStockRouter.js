import express from "express";
import {
  getInventory,
  updateIncoming,
  updateInventory,
  executeInventory,
  getAllInventory,
  submitInventory,
} from "../controllers/ManagementStock.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get(
  "/inventory",
  checkRole(["super admin", "warehouse member"]),
  getInventory
);
router.put(
  "/inventory/:id/:warehouseId",
  checkRole(["super admin", "warehouse member"]),
  checkUserWarehouse,
  updateInventory
);
router.put(
  "/incoming/:id/:warehouseId",
  checkRole(["super admin", "warehouse member"]),
  checkUserWarehouse,
  updateIncoming
);
router.get(
  "/inventory-execute/:plantId/:warehouseId",
  checkRole(["super admin", "warehouse member"]),
  executeInventory
);
router.get(
  "/inventory-all",
  checkRole(["super admin", "warehouse member"]),
  getAllInventory
);
router.post(
  "/inventory-submit/:warehouseId",
  checkRole(["super admin", "warehouse member"]),
  checkUserWarehouse,
  submitInventory
);


export default router;
