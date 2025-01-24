import AddressRack from "../models/AddressRackModel.js";
import DeliveryNote from "../models/DeliveryNoteModel.js";
import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import Incoming from "../models/IncomingModel.js";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";
import Warehouse from "../models/WarehouseModel.js";
import Storage from "../models/StorageModel.js";
import db from "../utils/Database.js";
import { handleUpdateIncoming } from "./ManagementStock.js";
import LogImport from "../models/LogImportModel.js";
import User from "../models/UserModel.js";
import { where } from "sequelize";

export const getDeliveryNoteByDnNo = async (req, res) => {
  try {
    const dn = req.query.dn;

    // validasi max dn 10 digit dan hanya angka
    if (dn.length > 10 || dn.length < 10 || !/^\d+$/.test(dn)) {
      return res.status(400).json({ message: "Invalid Delivery Note Number" });
    }

    const checkDnNo = await DeliveryNote.findOne({
      where: { dnNumber: dn },
    });

    if (!checkDnNo) {
      return res.status(404).json({ message: "Delivery Note not found" });
    }

    const tanggal = new Date(checkDnNo.arrivalPlanDate);
    const day = tanggal.getDay();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[day];

    let whereConditionDs = {
      schedule: day,
      flag: 1,
    };
    let viewOnly = false;

    if (checkDnNo.rit) {
      whereConditionDs.rit = checkDnNo.rit;
      viewOnly = true;
    }

    const data = await Supplier.findAll({
      attributes: ["id", "supplierName", "supplierCode"],
      where: { flag: 1 },
      include: [
        {
          model: DeliverySchedule,
          required: true,
          where: whereConditionDs,
        },
        {
          model: Material,
          required: true,
          attributes: ["id", "materialNo", "description", "uom"],
          where: { flag: 1 },
          include: [
            {
              model: Inventory,
              attributes: ["id", "materialId", "addressId"],
              required: true,
              include: [
                {
                  model: AddressRack,
                  required: true,
                  attributes: ["id", "addressRackName"],
                  where: { flag: 1 },
                  include: [
                    {
                      model: Storage,
                      required: true,
                      attributes: ["id", "storageName"],
                      where: { flag: 1 },
                      include: [
                        {
                          model: Plant,
                          required: true,
                          attributes: ["id", "plantName"],
                          where: { flag: 1 },
                          include: [
                            {
                              model: Warehouse,
                              required: true,
                              attributes: ["id", "warehouseName"],
                              where: { flag: 1 },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Incoming,
                  required: true,
                  include: [
                    {
                      model: DeliveryNote,
                      required: true,
                      where: {
                        dnNumber: dn,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    // mapping data
    const mappedData = data.map((item) => {
      const deliveryNotes = item.Materials.flatMap((material) =>
        material.Inventory.Incomings.map((incoming) => ({
          incomingId: incoming.id,
          warehouseId:
            material.Inventory.Address_Rack.Storage.Plant.Warehouse.id,
          dnNumber: incoming.Delivery_Note.dnNumber,
          materialNo: material.materialNo,
          address: material.Inventory.Address_Rack.addressRackName,
          description: material.description,
          uom: material.uom,
          reqQuantity: incoming.planning,
          receivedQuantity: incoming.actual,
          remain: incoming.actual - incoming.planning,
          status: incoming.status,
        }))
      );

      const vendorSchedules = item.Delivery_Schedules?.flatMap((schedule) => ({
        supplierName: item.supplierName,
        supplierCode: item.supplierCode,
        truckStation: schedule.truckStation,
        rit: schedule.rit,
        day: dayName,
        arrivalPlanDate:
          item.Materials[0].Inventory.Incomings[0].Delivery_Note
            .arrivalPlanDate,
        arrivalPlanTime: new Date(schedule.arrival).toISOString().slice(11, 16),
        departurePlanTime: new Date(schedule.departure)
          .toISOString()
          .slice(11, 16),
        arrivalActualTime: item.Materials[0].Inventory.Incomings[0]
          .Delivery_Note.arrivalActualTime
          ? new Date(
              item.Materials[0].Inventory.Incomings[0].Delivery_Note.arrivalActualTime
            )
              .toISOString()
              .slice(11, 16)
          : null,
        status: item.Materials[0].Inventory.Incomings[0].Delivery_Note.status,
      }));

      return {
        deliveryNotes,
        vendorSchedules,
      };
    });

    // Kirim data
    res.status(200).json({
      data: mappedData,
      message: "Data Delivery Note Found",
      viewOnly,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitDeliveryNote = async (req, res) => {
  try {
    const {
      dnNumber,
      arrivalActualDate,
      arrivalActualTime,
      departureActualDate,
      departureActualTime,
      rit,
      incomingIds,
      receivedQuantities,
    } = req.body;
    const userId = req.user.userId;

    // validasi max dnNumber 10 digit dan hanya angka
    if (
      dnNumber.length > 10 ||
      dnNumber.length < 10 ||
      !/^\d+$/.test(dnNumber)
    ) {
      return res.status(400).json({ message: "Invalid Delivery Note Number" });
    }

    const transaction = await db.transaction();

    const checkDnNo = await DeliveryNote.findAll(
      {
        where: { dnNumber },
        include: [
          {
            model: Incoming,
            required: true,
            attributes: ["id", "planning", "actual", "status"],
            include: [
              {
                model: Inventory,
                required: true,
                attributes: ["id", "materialId", "addressId"],
                include: [
                  {
                    model: Material,
                    required: true,
                    attributes: ["id", "materialNo", "description", "uom"],
                    where: { flag: 1 },
                    include: [
                      {
                        model: Supplier,
                        required: true,
                        attributes: ["id", "supplierName", "supplierCode"],
                        where: { flag: 1 },
                        include: [
                          {
                            model: DeliverySchedule,
                            required: true,
                            where: {
                              rit,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { transaction }
    );

    console.log("checkDnNo", checkDnNo.Incomings);

    // Check if DN Number is not found
    if (!checkDnNo) {
      return res.status(404).json({ message: "Delivery Note not found" });
    }

    // Check if DN Number is already processeds
    if (checkDnNo.rit) {
      return res
        .status(400)
        .json({ message: "Delivery Note already processed" });
    }

    const arrivalPlanDate = checkDnNo.arrivalPlanDate;
    const arrivalPlanTime =
      checkDnNo.Incomings[0]?.Inventory.Material.Supplier.Delivery_Schedules[0]
        ?.arrival;
    const departurePlanTime =
      checkDnNo.Incomings[0]?.Inventory.Material.Supplier.Delivery_Schedules[0]
        ?.departure;

    // Combine actual and plan dates with times
    const actualArrival = new Date(`${arrivalActualDate}T${arrivalActualTime}`);
    const plannedArrival = new Date(`${arrivalPlanDate}T${arrivalPlanTime}`);

    // Calculate delay
    const delay = actualArrival - plannedArrival;
    // console semua data
    console.log("delay", delay);
    console.log("arrivalPlanDate", arrivalPlanDate);
    console.log("arrivalPlanTime", arrivalPlanTime);
    console.log("arrivalActualDate", arrivalActualDate);
    console.log("arrivalActualTime", arrivalActualTime);
    console.log("departurePlanTime", departurePlanTime);
    console.log("departureActualDate", departureActualDate);
    console.log("departureActualTime", departureActualTime);
    console.log("rit", rit);
    console.log("incomingIds", incomingIds);
    console.log("receivedQuantities", receivedQuantities);
    console.log("userId", userId);
    return;

    await DeliveryNote.update(
      {
        status: delay > 0 ? "delayed" : "on schedule",
        arrivalPlanTime,
        arrivalActualDate,
        arrivalActualTime,
        departurePlanTime,
        departureActualDate,
        departureActualTime,
        rit,
      },
      {
        where: { dnNumber },
        transaction,
      }
    );

    // Update data in Incoming
    await handleUpdateIncoming(
      incomingIds,
      receivedQuantities,
      userId,
      transaction
    );

    await transaction.commit();

    res.status(200).json({ message: "Delivery Note Updated" });
  } catch (error) {
    // await transaction.rollback();
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDeliveryNoteByDate = async (req, res) => {
  try {
    const { importDate } = req.query;

    let whereCondition = {};
    let whereConditionDn = {};
    if (importDate) {
      whereCondition.importDate = importDate;
    }

    if (!importDate) {
      whereConditionDn.arrivalPlanDate = new Date().toISOString().split("T")[0]; // get date only
    }

    const data = await DeliveryNote.findAll({
      where: whereConditionDn,
      include: [
        {
          model: Incoming,
          required: true,
          attributes: ["id", "planning", "actual", "status"],
          include: [
            {
              model: Inventory,
              required: true,
              attributes: ["id", "materialId", "addressId"],
              include: [
                {
                  model: Material,
                  required: true,
                  attributes: ["id", "materialNo", "description", "uom"],
                  where: { flag: 1 },
                },
                {
                  model: AddressRack,
                  required: true,
                  attributes: ["id", "addressRackName"],
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
        {
          model: LogImport,
          required: true,
          attributes: ["id", "typeLog", "fileName", "importDate"],
          where: whereCondition,
          include: [
            {
              model: User,
              required: true,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    const mappedData = data.flatMap((item) =>
      item.Incomings.map((incoming) => ({
        dnNumber: item.dnNumber,
        arrivalPlanDate: item.arrivalPlanDate,
        materialNo: incoming.Inventory.Material.materialNo,
        description: incoming.Inventory.Material.description,
        uom: incoming.Inventory.Material.uom,
        addressRackName: incoming.Inventory.Address_Rack.addressRackName,
        planningQuantity: incoming.planning,
        importDate: item.Log_Import.importDate,
        importBy: item.Log_Import.User.username,
      }))
    );

    res
      .status(200)
      .json({ data: mappedData, message: "Data Delivery Note Found" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
