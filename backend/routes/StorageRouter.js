import express from "express";
import { getStorage, getStorageById, createStorage, updateStorage, deleteStorage } from "../controllers/Storage.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/storage", checkRole(["super admin", "warehouse staff"]), getStorage);
router.get("/storage/:id", checkRole(["super admin"]), getStorageById);
router.post("/storage", checkRole(["super admin"]), createStorage);
router.put("/storage/:id", checkRole(["super admin"]), updateStorage);
router.get("/storage-delete/:id", checkRole(["super admin"]), deleteStorage);
// router.get("/storage-shop/:id", checkRole(["super admin", "warehouse staff"]), getStorageByShop);

export default router;
