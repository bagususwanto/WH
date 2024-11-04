import express from "express";
import { getOrderApproval, getDetailOrderApproval, approveOrder } from "../controllers/Approval.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get(
  "/approval/:warehouseId",
  checkRole(["super admin", "line head", "section head", "department head"]),
  checkUserWarehouse,
  getOrderApproval
);
router.get(
  "/approval-detail/:orderId/:warehouseId",
  checkRole(["super admin", "line head", "section head", "department head"]),
  checkUserWarehouse,
  getDetailOrderApproval
);
router.post("/approve/:orderId/:warehouseId", checkRole(["line head", "section head", "department head"]), checkUserWarehouse, approveOrder);

export default router;
