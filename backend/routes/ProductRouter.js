import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getProduct, getProductByCategory } from "../controllers/Product.js";

const router = express.Router();

router.get("/product/:warehouseId", checkRole(["super admin"]), getProduct);
router.get("/product-category/:warehouseId/:categoryId", checkRole(["super admin"]), getProductByCategory);

export default router;
