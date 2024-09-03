import express from "express";
import { getShop, getShopById, createShop, updateShop, deleteShop, getShopByPlant } from "../controllers/Shop.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/shop", checkRole(["super admin"]), getShop);
router.get("/shop/:id", checkRole(["super admin"]), getShopById);
router.post("/shop", checkRole(["super admin"]), createShop);
router.put("/shop/:id", checkRole(["super admin"]), updateShop);
router.get("/shop-delete/:id", checkRole(["super admin"]), deleteShop);
router.get("/shop-plant/:id", checkRole(["super admin"]), getShopByPlant);

export default router;
