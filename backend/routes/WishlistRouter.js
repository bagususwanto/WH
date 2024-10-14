import express from "express";
import { getWishlistByUser, addToWishlist, clearWishlist, removeFromWishlist } from "../controllers/Wishlist.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/wishlist", checkRole(["super admin"]), getWishlistByUser);
router.post("/wishlist", checkRole(["super admin"]), addToWishlist);
router.delete("/wishlist-clear", checkRole(["super admin"]), clearWishlist);
router.delete("/wishlist-delete", checkRole(["super admin"]), removeFromWishlist);

export default router;
