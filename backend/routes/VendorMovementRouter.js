import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import {
  createVendorMovement,
  getVendorMovement,
} from "../controllers/VendorMovement.js";

const router = express.Router();

router.post(
  "/vendor-arrival",
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
  createVendorMovement
);
router.get(
  "/vendor-arrival",
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
  getVendorMovement
);

export default router;
