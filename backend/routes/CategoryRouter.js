import express from "express";
import { getCategory, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/Category.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/category", getCategory);
router.get("/category/:id", getCategoryById);
router.post("/category", createCategory);
router.put("/category/:id", updateCategory);
router.get("/category-delete/:id", deleteCategory);

export default router;
