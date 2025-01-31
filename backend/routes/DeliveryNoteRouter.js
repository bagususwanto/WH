import express from "express";
import {
  getDeliveryNoteByDnNo,
  submitDeliveryNote,
  getDeliveryNoteByDate,
} from "../controllers/DeliveryNote.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

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
router.post(
  "/delivery-note-submit/:warehouseId",
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
  checkUserWarehouse,
  submitDeliveryNote
);
router.get(
  "/delivery-note-date",
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
  getDeliveryNoteByDate
);

export default router;
