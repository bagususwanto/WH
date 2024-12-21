import express from "express";
import {
  getTypeMaterialData,
  getStatusOrder,
  getMrpType,
  getUom,
  getPosition,
} from "../controllers/HarcodedData.js";

const router = express.Router();

router.get("/material-type", getTypeMaterialData);
router.get("/status-order", getStatusOrder);
router.get("/mrp-type", getMrpType);
router.get("/uom", getUom);
router.get("/position", getPosition);

export default router;
