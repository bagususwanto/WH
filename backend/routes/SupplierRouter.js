import express from "express";
import {
  getSupplier,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getVendorNameByVendorCode,
} from "../controllers/Supplier.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/supplier", checkRole(["super admin"]), getSupplier);
router.get("/supplier-public", getSupplier);
router.get("/supplier/:id", checkRole(["super admin"]), getSupplierById);
router.post("/supplier", checkRole(["super admin"]), createSupplier);
router.put("/supplier/:id", checkRole(["super admin"]), updateSupplier);
router.get("/supplier-delete/:id", checkRole(["super admin"]), deleteSupplier);
router.get("/supplier-code", getVendorNameByVendorCode);

export default router;
