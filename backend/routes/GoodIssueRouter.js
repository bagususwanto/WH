import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getGoodIssue } from "../controllers/GoodIssue.js";

const router = express.Router();

router.get(
  "/good-issue",
  checkRole(["super admin", "warehouse member", "warehouse staff"]),
  getGoodIssue
);

export default router;
