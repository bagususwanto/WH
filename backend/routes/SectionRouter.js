import express from "express";
import { getSection, getSectionById, createSection, updateSection, deleteSection } from "../controllers/Section.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/section", checkRole(["super admin"]), getSection);
router.get("/section/:id", checkRole(["super admin"]), getSectionById);
router.post("/section", checkRole(["super admin"]), createSection);
router.put("/section/:id", checkRole(["super admin"]), updateSection);
router.get("/section-delete/:id", checkRole(["super admin"]), deleteSection);

export default router;
