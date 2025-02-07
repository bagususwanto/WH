import express from "express";
import {
  getSupplier,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/Supplier.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/supplier", checkRole(["super admin"]), getSupplier);
router.get("/supplier-public", checkRole(["super admin"]), getSupplier);
router.get("/supplier/:id", checkRole(["super admin"]), getSupplierById);
router.post("/supplier", checkRole(["super admin"]), createSupplier);
router.put("/supplier/:id", checkRole(["super admin"]), updateSupplier);
router.get("/supplier-delete/:id", checkRole(["super admin"]), deleteSupplier);

export default router;
