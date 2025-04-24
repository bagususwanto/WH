import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";
import VendorMovement from "../models/VendorMovementModel.js";
import db from "../utils/Database.js";

// Define tolerance in milliseconds (15 minutes)
const tolerance = 15;

function timeStringToMinutes(str) {
  const [hours, minutes] = str.split(":").map(Number);
  return hours * 60 + minutes;
}

export const createVendorMovement = async (req, res) => {
  const transaction = await db.transaction();
  try {
    // Body
    const {
      supplierId,
      arrivalPlanTime,
      arrivalActualTime,
      departurePlanTime,
      truckStation,
      rit,
      plantId,
    } = req.body;

    // Validasi data tersedia
    if (
      !supplierId ||
      !arrivalPlanTime ||
      !arrivalActualTime ||
      !departurePlanTime ||
      !truckStation ||
      !rit ||
      !plantId
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const supplier = await Supplier.findOne({
      where: { id: supplierId, flag: 1 },
    });
    if (!supplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    const existingVendorMovement = await VendorMovement.findOne({
      where: {
        supplierId,
        movementDate: new Date().toLocaleDateString("en-CA"),
        truckStation,
        rit,
        plantId,
      },
    });

    if (existingVendorMovement) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Vendors with that schedule already have arrivals on this date, please select another schedule.",
      });
    }

    const delay =
      timeStringToMinutes(arrivalActualTime) -
      timeStringToMinutes(arrivalPlanTime) -
      tolerance;

    // Buat vendor movement baru
    await VendorMovement.create(
      {
        supplierId,
        movementDate: new Date().toLocaleDateString("en-CA"),
        arrivalPlanTime,
        arrivalActualTime,
        departurePlanTime,
        truckStation,
        rit,
        plantId,
        status: delay > 0 ? "overdue" : "on schedule",
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({
      message: "Delivery Schedule Created",
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


