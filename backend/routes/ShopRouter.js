import express from "express";
import { getShop, getShopById, createShop, updateShop, deleteShop, getShopByPlant } from "../controllers/Shop.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/shop", getShop);
router.get("/shop/:id", getShopById);
router.post("/shop", createShop);
router.put("/shop/:id", updateShop);
router.get("/shop-delete/:id", deleteShop);
router.get("/shop-plant/:id", getShopByPlant);

export default router;
