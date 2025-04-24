import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { createVendorMovement } from "../controllers/VendorMovement.js";

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

export default router;
