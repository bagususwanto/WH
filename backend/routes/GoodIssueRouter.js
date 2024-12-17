import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getGoodIssue } from "../controllers/GoodIssue.js";

const router = express.Router();

router.get(
  "/good-issue",
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
    [0]
  ),
  getGoodIssue
);

export default router;
