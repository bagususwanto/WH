import express from "express";
import {
  getLine,
  getLineById,
  createLine,
  updateLine,
  deleteLine,
  getLineSpecific,
} from "../controllers/Line.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/line", checkRole(["super admin"]), getLine);
router.get("/line/:id", checkRole(["super admin"]), getLineById);
router.post("/line", checkRole(["super admin"]), createLine);
router.put("/line/:id", checkRole(["super admin"]), updateLine);
router.get("/line-delete/:id", checkRole(["super admin"]), deleteLine);
router.get("/line-public", getLine);
router.get("/line-specific-public", getLineSpecific);

export default router;
