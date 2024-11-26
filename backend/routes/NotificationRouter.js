import express from "express";
import {
  getUnreadNotificationCount,
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationAsRead,
} from "../controllers/Notification.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get("/notification/:warehouseId", getNotificationsByUserId);
router.get("/notification-count/:warehouseId", getUnreadNotificationCount);
router.post(
  "/read-notification/:warehouseId/:notificationId",
  checkUserWarehouse,
  markNotificationAsRead
);
router.post(
  "/read-all-notification/:warehouseId",
  checkUserWarehouse,
  markAllNotificationAsRead
);

export default router;
