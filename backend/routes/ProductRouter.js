import express from "express";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { getProduct, getProductByCategory, getProductByQuery, getAllProduct } from "../controllers/Product.js";

const router = express.Router();

router.get("/product/:warehouseId", checkRole(["super admin"]), getProduct);
router.get("/product-category/:warehouseId/:categoryId", checkRole(["super admin"]), getProductByCategory);
router.get("/product/search/:warehouseId", checkRole(["super admin"]), getProductByQuery);
router.get("/product-all/:warehouseId", checkRole(["super admin"]), getAllProduct);

export default router;
