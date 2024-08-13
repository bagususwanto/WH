import express from "express";
import { getAddressRack, getAddressRackById, createAddressRack, updateAddressRack, deleteAddressRack } from "../controllers/AddressRack.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/address-rack", getAddressRack);
router.get("/address-rack/:id", getAddressRackById);
router.post("/address-rack", createAddressRack);
router.put("/address-rack/:id", updateAddressRack);
router.get("/address-rack-delete/:id", deleteAddressRack);

export default router;
