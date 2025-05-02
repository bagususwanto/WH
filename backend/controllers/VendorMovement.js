import { Op } from "sequelize";
import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";
import VendorMovement from "../models/VendorMovementModel.js";
import db from "../utils/Database.js";
import LogEntry from "../models/LogEntryModel.js";
import DeliveryNote from "../models/DeliveryNoteModel.js";
import Incoming from "../models/IncomingModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";

// Define tolerance in milliseconds (15 minutes)
const tolerance = 15;

function timeStringToMinutes(str) {
  if (!str) return null;
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
      !arrivalActualTime ||
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
    const vendorMovement = await VendorMovement.create(
      {
        supplierId,
        movementDate: new Date().toLocaleDateString("en-CA"),
        arrivalPlanTime,
        arrivalActualTime,
        departurePlanTime,
        truckStation,
        rit,
        plantId,
        status:
          arrivalPlanTime === null
            ? "unscheduled"
            : delay > 0
            ? "overdue"
            : "on schedule",
      },
      { transaction }
    );

    await LogEntry.create(
      {
        userId: req.user.userId,
        typeLogEntry: "create vendor movement",
        vendorMovementId: vendorMovement.id,
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

export const getVendorMovement = async (req, res) => {
  const { plantId, startDate, endDate, status } = req.query;
  let whereCondition = {};

  if (plantId) {
    whereCondition.plantId = plantId;
  }

  if (startDate && endDate) {
    whereCondition.movementDate = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (status) {
    whereCondition.status = status;
  }

  try {
    const data = await VendorMovement.findAll({
      where: whereCondition,
      include: [
        {
          model: Supplier,
          required: true,
          attributes: ["id", "supplierCode", "supplierName"],
        },
        {
          model: Plant,
          required: true,
          attributes: ["id", "plantCode", "plantName"],
        },
        {
          model: DeliveryNote,
          attributes: [
            "id",
            "deliveryDate",
            "dnNumber",
            "completeItems",
            "totalItems",
            "updatedAt",
          ],
          required: false,
          through: { attributes: [] },
          include: [
            {
              model: Incoming,
              attributes: ["id", "planning", "actual", "status"],
              required: true,
              include: [
                {
                  model: Inventory,
                  required: true,
                  attributes: ["id"],
                  include: [
                    {
                      model: Material,
                      required: true,
                      attributes: ["id", "materialNo", "description", "uom"],
                    },
                    {
                      model: AddressRack,
                      required: true,
                      attributes: ["id", "addressRackName"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "Data Vendor Movement Not Found" });
    }

    const mappedData = data.map((item) => {
      const deliveryNotes = item.Delivery_Notes.map((dn) => ({
        id: dn.id,
        dnNumber: dn.dnNumber,
        deliveryDate: dn.deliveryDate,
        completeItems: dn.completeItems,
        totalItems: dn.totalItems,
        updatedAt: dn.updatedAt,
        Materials: dn.Incomings.map((inc) => ({
          incomingId: inc.id,
          materialNo: inc.Inventory.Material.materialNo,
          description: inc.Inventory.Material.description,
          uom: inc.Inventory.Material.uom,
          address: inc.Inventory.Address_Rack.addressRackName,
          reqQuantity: inc.planning,
          actQuantity: inc.actual,
          remain: inc.actual - inc.planning,
          status: inc.status,
        })),
      }));

      return {
        id: item.id,
        movementDate: item.movementDate,
        supplierName: item.Supplier.supplierName,
        plantName: item.Plant.plantName,
        arrivalPlanTime: item.arrivalPlanTime,
        arrivalActualTime: item.arrivalActualTime,
        departurePlanTime: item.departurePlanTime,
        truckStation: item.truckStation,
        rit: item.rit,
        status: item.status,
        DeliveryNotes: deliveryNotes || null,
      };
    });

    res
      .status(200)
      .json({ data: mappedData, message: "Data Vendor Movement Found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
