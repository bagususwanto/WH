import express from "express";
import {
  getTypeMaterialData,
  getStatusOrder,
} from "../controllers/HarcodedData.js";

const router = express.Router();

router.get("/material-type", getTypeMaterialData);
router.get("/status-order", getStatusOrder);

export default router;
