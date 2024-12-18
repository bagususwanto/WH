import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getRedpost } from "../controllers/Redpost.js";

const router = express.Router();

router.get(
  "/redpost",
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
  getRedpost
);

export default router;
