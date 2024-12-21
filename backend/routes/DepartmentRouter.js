import express from "express";
import {
  getDepartment,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/Department.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/department", checkRole(["super admin"]), getDepartment);
router.get("/department/:id", checkRole(["super admin"]), getDepartmentById);
router.post("/department", checkRole(["super admin"]), createDepartment);
router.put("/department/:id", checkRole(["super admin"]), updateDepartment);
router.get(
  "/department-delete/:id",
  checkRole(["super admin"]),
  deleteDepartment
);
router.get("/department-public", getDepartment);

export default router;
