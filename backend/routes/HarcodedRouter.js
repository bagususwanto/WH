import express from "express";
import { getTypeMaterialData } from "../controllers/HarcodedData.js";

const router = express.Router();

router.get("/material-type", getTypeMaterialData);

export default router;
