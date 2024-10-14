import express from "express";
import { getWBS, getWBSById, createWBS, updateWBS, deleteWBS } from "../controllers/WBS.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/wbs", checkRole(["super admin"]), getWBS);
router.get("/wbs/:id", checkRole(["super admin"]), getWBSById);
router.post("/wbs", checkRole(["super admin"]), createWBS);
router.put("/wbs/:id", checkRole(["super admin"]), updateWBS);
router.get("/wbs-delete/:id", checkRole(["super admin"]), deleteWBS);

export default router;
