import express from "express";
import {
  getDeliverySchedule,
  getDeliveryScheduleById,
  createDeliverySchedule,
  updateDeliverySchedule,
  deleteDeliverySchedule,
} from "../controllers/DeliverySchedule.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

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
router.get(
  "/delivery-schedule/:id",
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
  getDeliveryScheduleById
);
router.post(
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
  createDeliverySchedule
);
router.put(
  "/delivery-schedule/:id",
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
  updateDeliverySchedule
);
router.get(
  "/delivery-schedule-delete/:id",
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
  deleteDeliverySchedule
);

export default router;
