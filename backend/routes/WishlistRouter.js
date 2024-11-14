import express from "express";
import { getWishlistByUser, addToWishlist, clearWishlist, removeFromWishlist } from "../controllers/Wishlist.js";
import { checkRole } from "../middleware/RoleMiddleware.js";
import { checkUserWarehouse } from "../middleware/UserWarehouseMiddleware.js";

const router = express.Router();

router.get(
  "/wishlist/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head", "warehouse staff", "warehouse member"]),
  getWishlistByUser
);
router.post(
  "/wishlist/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  addToWishlist
);
router.delete("/wishlist-clear", checkRole(["super admin", "group head", "line head", "section head", "department head"]), clearWishlist);
router.delete(
  "/wishlist-delete/:inventoryId/:warehouseId",
  checkRole(["super admin", "group head", "line head", "section head", "department head"]),
  checkUserWarehouse,
  removeFromWishlist
);

export default router;
