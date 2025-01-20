import express from "express";
import {
  getDeliverySchedule,
//   getDeliveryScheduleById,
//   createDeliverySchedule,
//   updateDeliverySchedule,
//   deleteDeliverySchedule,
} from "../controllers/DeliverySchedule.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get(
  "/delivery-schedule",
  checkRole(
    [
      "super admin",
      "warehouse member",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  getDeliverySchedule
);
// router.get("/DeliverySchedule/:id", checkRole(["super admin"]), getDeliveryScheduleById);
// router.post("/DeliverySchedule", checkRole(["super admin"]), createDeliverySchedule);
// router.put("/DeliverySchedule/:id", checkRole(["super admin"]), updateDeliverySchedule);
// router.get("/DeliverySchedule-delete/:id", checkRole(["super admin"]), deleteDeliverySchedule);

export default router;
