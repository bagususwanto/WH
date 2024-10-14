import express from "express";
import { getServiceHours, getServiceHoursByPlantId, createServiceHours, updateServiceHours, deleteServiceHours } from "../controllers/ServiceHours.js";
import { checkRole } from "../middleware/RoleMiddleware.js";

const router = express.Router();

router.get("/service-hours", checkRole(["super admin"]), getServiceHours);
router.get("/service-hours", checkRole(["super admin"]), getServiceHoursByPlantId);
router.post("/service-hours", checkRole(["super admin"]), createServiceHours);
router.put("/service-hours/:shiftId/:plantId", checkRole(["super admin"]), updateServiceHours);
router.get("/service-hours-delete/:shiftId/:plantId", checkRole(["super admin"]), deleteServiceHours);

export default router;
