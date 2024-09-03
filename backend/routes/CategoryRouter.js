import express from "express";
import { getCategory, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/Category.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/category", checkRole(["super admin"]), getCategory);
router.get("/category/:id", checkRole(["super admin"]), getCategoryById);
router.post("/category", checkRole(["super admin"]), createCategory);
router.put("/category/:id", checkRole(["super admin"]), updateCategory);
router.get("/category-delete/:id", checkRole(["super admin"]), deleteCategory);

export default router;
