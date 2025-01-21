import express from "express";
import { getDeliveryNoteByDnNo } from "../controllers/DeliveryNote.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get(
  "/delivery-note",
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
  getDeliveryNoteByDnNo
);

export default router;
