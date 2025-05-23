import express from "express";
import {
  getDeliveryNoteByDnNo,
  submitDeliveryNote,
  getDeliveryNoteByDate,
  getDnInquiry,
  updateQuantityDN,
  // getArrivalMonitoring,
  // getArrivalChart,
  // getDnChartHistory,
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
router.get(
  "/delivery-note-inquiry",
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
  getDnInquiry
);
router.post(
  "/delivery-note-inquiry/:warehouseId",
  checkRole(
    [
      "super admin",
      "warehouse staff",
      "group head",
      "line head",
      "section head",
      "department head",
    ],
    [1]
  ),
  updateQuantityDN
);
// router.get(
//   "/arrival-monitoring",
//   checkRole(
//     [
//       "super admin",
//       "warehouse member",
//       "warehouse staff",
//       "group head",
//       "line head",
//       "section head",
//       "department head",
//     ],
//     [1]
//   ),
//   getArrivalMonitoring
// );
// router.get(
//   "/arrival-chart",
//   checkRole(
//     [
//       "super admin",
//       "warehouse member",
//       "warehouse staff",
//       "group head",
//       "line head",
//       "section head",
//       "department head",
//     ],
//     [1]
//   ),
//   getArrivalChart
// );
// router.get(
//   "/dn-chart-history",
//   checkRole(
//     [
//       "super admin",
//       "warehouse member",
//       "warehouse staff",
//       "group head",
//       "line head",
//       "section head",
//       "department head",
//     ],
//     [1]
//   ),
//   getDnChartHistory
// );


export default router;
