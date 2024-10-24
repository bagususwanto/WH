import express from "express";
import { getWishlistByUser, addToWishlist, clearWishlist, removeFromWishlist } from "../controllers/Wishlist.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/wishlist/:warehouseId", checkRole(["super admin", "group head", "line head", "section head", "department head"]), getWishlistByUser);
router.post("/wishlist", checkRole(["super admin", "group head", "line head", "section head", "department head"]), addToWishlist);
router.delete("/wishlist-clear", checkRole(["super admin", "group head", "line head", "section head", "department head"]), clearWishlist);
router.delete(
  "/wishlist-delete/:inventoryId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  removeFromWishlist
);

export default router;
