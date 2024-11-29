import express from "express";
import {
  getTypeMaterialData,
  getStatusOrder,
  getMrpType,
  getUom,
} from "../controllers/HarcodedData.js";

const router = express.Router();

router.get("/material-type", getTypeMaterialData);
router.get("/status-order", getStatusOrder);
router.get("/mrp-type", getMrpType);
router.get("/uom", getUom);

export default router;
