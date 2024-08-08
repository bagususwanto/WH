import express from "express";
import { getShops, addShop } from "../controllers/Shop.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/shops", verifyToken, getShops);
router.post("/shops", verifyToken, addShop);

export default router;
