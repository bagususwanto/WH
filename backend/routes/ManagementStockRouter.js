import express from "express";
import { getInventory, updateIncoming, updateInventory, executeInventory, getAllInventory, submitInventory } from "../controllers/ManagementStock.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get("/inventory/:storageId", checkRole(["super admin", "warehouse member"]), getInventory);
router.put("/inventory/:id/:warehouseId", checkRole(["super admin", "warehouse member"]), checkUserWarehouse, updateInventory);
router.put("/incoming/:id", checkRole(["super admin", "warehouse member"]), checkUserWarehouse, updateIncoming);
router.get("/inventory-execute", checkRole(["super admin", "warehouse member"]), executeInventory);
router.get("/inventory-all", checkRole(["super admin", "warehouse member"]), getAllInventory);
router.post("/inventory-submit/:warehouseId", checkRole(["super admin", "warehouse member"]), checkUserWarehouse, submitInventory);

export default router;
