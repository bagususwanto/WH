import express from "express";
import { getProduct, getProductByCategory, getProductByQuery, getAllProduct } from "../controllers/Product.js";

const router = express.Router();

router.get("/product/:warehouseId", getProduct);
router.get("/product-category/:warehouseId/:categoryId", getProductByCategory);
router.get("/product/search/:warehouseId", getProductByQuery);
router.get("/product-all/:warehouseId", getAllProduct);

export default router;
