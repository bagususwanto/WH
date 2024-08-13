import express from "express";
import { getLocation, getLocationById, createLocation, updateLocation, deleteLocation } from "../controllers/Location.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/location", getLocation);
router.get("/location/:id", getLocationById);
router.post("/location", createLocation);
router.put("/location/:id", updateLocation);
router.get("/location-delete/:id", deleteLocation);

export default router;
