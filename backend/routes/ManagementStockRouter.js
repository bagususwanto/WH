import express from "express";
import {
  getInventory,
  updateIncoming,
  updateInventory,
  executeInventory,
  getAllInventory,
  submitInventory,
  createPlanIncoming,
} from "../controllers/ManagementStock.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get(
  "/inventory",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  getInventory
);
router.put(
  "/inventory/:id/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  updateInventory
);
router.put(
  "/incoming/:id/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  updateIncoming
);
router.post(
  "/incoming/:warehouseId",
  checkRole(["super admin", "warehouse staff"]),
  checkUserWarehouse,
  createPlanIncoming
);
router.get(
  "/inventory-execute/:plantId/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  executeInventory
);
router.get(
  "/inventory-all",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  getAllInventory
);
router.post(
  "/inventory-submit/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  checkUserWarehouse,
  submitInventory
);

export default router;
