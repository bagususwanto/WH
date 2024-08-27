import express from "express";
import { getStorage, getStorageById, createStorage, updateStorage, deleteStorage, getStorageByShop } from "../controllers/Storage.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/storage", getStorage);
router.get("/storage/:id", getStorageById);
router.post("/storage", createStorage);
router.put("/storage/:id", updateStorage);
router.get("/storage-delete/:id", deleteStorage);
router.get("/storage-shop/:id", getStorageByShop);

export default router;
