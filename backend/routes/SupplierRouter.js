import express from "express";
import { getSupplier, getSupplierById, createSupplier, updateSupplier, deleteSupplier } from "../controllers/Supplier.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/supplier", getSupplier);
router.get("/supplier/:id", getSupplierById);
router.post("/supplier", createSupplier);
router.put("/supplier/:id", updateSupplier);
router.get("/supplier-delete/:id", deleteSupplier);

export default router;
