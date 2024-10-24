import express from "express";
import { getStorage, getStorageById, createStorage, updateStorage, deleteStorage, getStorageByPlant } from "../controllers/Storage.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/storage", checkRole(["super admin"]), getStorage);
router.get("/storage-public", checkRole(["super admin", "warehouse member"]), getStorage);
router.get("/storage/:id", checkRole(["super admin"]), getStorageById);
router.post("/storage", checkRole(["super admin"]), createStorage);
router.put("/storage/:id", checkRole(["super admin"]), updateStorage);
router.get("/storage-delete/:id", checkRole(["super admin"]), deleteStorage);
router.get("/storage-plant/:id", checkRole(["super admin", "warehouse member"]), getStorageByPlant);

export default router;
