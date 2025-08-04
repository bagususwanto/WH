import express from "express";
import {
  getInventoryMaterialAll,
  getInventoryByStatus,
} from "../controllers/Material.js";
import {
  checkUserId,
  getUserByIds,
  getUserByNoreg,
  getUseridsByNoregOrName,
} from "../controllers/User.js";
import { checkLineId, getLineByIds } from "../controllers/Line.js";
import { checkSectionId, getSectionByIds } from "../controllers/Section.js";

const router = express.Router();

router.get("/inventory-material-all", getInventoryMaterialAll);
router.get("/inventory-status", getInventoryByStatus);
router.get("/user-ids", getUserByIds);
router.get("/line-ids", getLineByIds);
router.get("/section-ids", getSectionByIds);
router.get("/user-noreg", getUserByNoreg);
router.get("/check-user-id/:userId", checkUserId);
router.get("/check-line-id/:lineId", checkLineId);
router.get("/check-section-id/:sectionId", checkSectionId);
router.get("/user-noreg-name", getUseridsByNoregOrName);

export default router;
