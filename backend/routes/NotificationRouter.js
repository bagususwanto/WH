import express from "express";
import { getUnreadNotificationCount, getNotificationsByUserId } from "../controllers/Notification.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get(
  "/notification/:warehouseId",
  checkRole(["super admin", "warehouse staff", "group head", "line head", "section head", "department head"]),
  getNotificationsByUserId
);
router.get(
  "/notification-count/:warehouseId",
  checkRole(["super admin", "warehouse staff", "group head", "line head", "section head", "department head"]),
  getUnreadNotificationCount
);

export default router;
