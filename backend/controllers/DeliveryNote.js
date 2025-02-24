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
import {
  handleUpdateIncoming,
  processIncomingUpdate,
} from "./ManagementStock.js";
import LogImport from "../models/LogImportModel.js";
import User from "../models/UserModel.js";
import { Op, Sequelize } from "sequelize";
import IncomingHistory from "../models/IncomingHistoryModel.js";

// Define tolerance in milliseconds (15 minutes = 15 * 60 * 1000 ms)
const tolerance = 15 * 60 * 1000;

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
          required: false,
          where: whereConditionDs,
        },
        {
          model: DeliveryNote,
          required: true,
          where: {
            dnNumber: dn,
          },
          include: [
            {
              model: Incoming,
              required: true,
              include: [
                {
                  model: Inventory,
                  attributes: ["id", "materialId", "addressId"],
                  required: true,
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
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    // return res.status(200).json({ data: data });

    // mapping data
    const mappedData = data.map((item) => {
      const deliveryNotes = item.Delivery_Notes.flatMap((dn) =>
        dn.Incomings.map((incoming) => ({
          incomingId: incoming.id,
          warehouseId:
            incoming.Inventory.Address_Rack.Storage.Plant.Warehouse.id,
          dnNumber: dn.dnNumber,
          materialNo: incoming.Inventory.Material.materialNo,
          address: incoming.Inventory.Address_Rack.addressRackName,
          description: incoming.Inventory.Material.description,
          uom: incoming.Inventory.Material.uom,
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
        arrivalPlanDate: item.Delivery_Notes[0]?.arrivalPlanDate,
        arrivalPlanTime: new Date(schedule.arrival).toISOString().slice(11, 16),
        departurePlanDate: item.Delivery_Notes[0]?.departurePlanDate,
        departurePlanTime: new Date(schedule.departure)
          .toISOString()
          .slice(11, 16),
        arrivalActualDate: item.Delivery_Notes[0]?.arrivalActualDate,
        departureActualDate: item.Delivery_Notes[0]?.departureActualDate,
        arrivalActualTime: item.Delivery_Notes[0]?.arrivalActualTime
          ? new Date(item.Delivery_Notes[0]?.arrivalActualTime)
              .toISOString()
              .slice(11, 16)
          : null,
        departureActualTime: item.Delivery_Notes[0]?.departureActualTime
          ? new Date(item.Delivery_Notes[0]?.departureActualTime)
              .toISOString()
              .slice(11, 16)
          : null,
        status: item.Delivery_Notes[0]?.status,
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

const formatTimeToHHMMSS = (time) => {
  // Jika panjang string adalah 8 (sudah memiliki format HH:mm:ss), kembalikan langsung
  if (time.length === 8) {
    return time;
  }
  // Jika panjang string bukan 8, tambahkan detik default
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}:00`;
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

    // validasi required
    if (
      !dnNumber ||
      !arrivalActualDate ||
      !arrivalActualTime ||
      !departureActualDate ||
      !departureActualTime ||
      !rit ||
      !incomingIds ||
      !receivedQuantities
    ) {
      return res
        .status(400)
        .json({ message: "Missing required parameters, please check again" });
    }

    // pastikan receivedQuantities diubah ke number
    for (let i = 0; i < receivedQuantities.length; i++) {
      receivedQuantities[i] = Number(receivedQuantities[i]);
    }

    // Validasi quantities tidak boleh null
    if (receivedQuantities.includes(null)) {
      return res
        .status(400)
        .json({ message: "Received quantities cannot be null" });
    }

    // validasi max dnNumber 10 digit dan hanya angka
    if (
      dnNumber.length > 10 ||
      dnNumber.length < 10 ||
      !/^\d+$/.test(dnNumber)
    ) {
      return res.status(400).json({ message: "Invalid Delivery Note Number" });
    }

    const dn = await DeliveryNote.findOne({
      where: { dnNumber },
    });

    if (!dn) {
      return res.status(404).json({ message: "Delivery Note not found" });
    }

    const tanggal = new Date(dn.arrivalPlanDate);
    const day = tanggal.getDay();

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
                              schedule: day,
                              flag: 1,
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

    const arrivalPlanDate = new Date(checkDnNo[0].arrivalPlanDate)
      .toISOString()
      .split("T")[0]; // date only format
    const arrivalPlanTime = new Date(
      checkDnNo[0].Incomings[0]?.Inventory.Material.Supplier.Delivery_Schedules[0]?.arrival
    )
      .toISOString()
      .slice(11, 16); // time only format
    const departurePlanTime = new Date(
      checkDnNo[0].Incomings[0]?.Inventory.Material.Supplier.Delivery_Schedules[0]?.departure
    )
      .toISOString()
      .slice(11, 16); // time only format

    const truckStation =
      checkDnNo[0].Incomings[0]?.Inventory.Material.Supplier
        .Delivery_Schedules[0]?.truckStation;

    // Combine actual and plan dates with times
    const actualArrival = new Date(`${arrivalActualDate}T${arrivalActualTime}`);
    const plannedArrival = new Date(`${arrivalPlanDate}T${arrivalPlanTime}`);

    // Calculate delay with tolerance
    const delay = actualArrival - plannedArrival - tolerance;

    await DeliveryNote.update(
      {
        status: delay > 0 ? "overdue" : "on schedule",
        arrivalPlanTime,
        arrivalActualDate,
        arrivalActualTime,
        departurePlanTime,
        departureActualDate,
        departureActualTime,
        rit,
        truckStation,
      },
      {
        where: { dnNumber },
        transaction,
      }
    );

    try {
      // Update data in Incoming
      await handleUpdateIncoming(
        incomingIds,
        receivedQuantities,
        userId,
        transaction
      );
    } catch (error) {
      await transaction.rollback();
      return res.status(400).json({ message: error.message });
    }

    await transaction.commit();

    res.status(200).json({ message: "Delivery Note Updated" });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDeliveryNoteByDate = async (req, res) => {
  try {
    const { importDate, arrivalDate } = req.query;

    let whereCondition = {};
    let whereConditionDn = {};
    if (importDate) {
      whereCondition.importDate = importDate;
    }

    if (arrivalDate) {
      whereConditionDn.arrivalPlanDate = arrivalDate;
    }

    const data = await DeliveryNote.findAll({
      where: whereConditionDn,
      include: [
        {
          model: Supplier,
          required: true,
          attributes: ["id", "supplierName", "supplierCode"],
        },
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
        supplierName: item.Supplier.supplierName,
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

export const getDnInquiry = async (req, res) => {
  try {
    const { plantId, startDate, endDate } = req.query;

    let whereConditionPlant = { flag: 1 };
    let whereConditionDn = { rit: { [Op.ne]: null } };

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    if (startDate && endDate) {
      whereConditionDn.arrivalPlanDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const data = await Supplier.findAll({
      attributes: ["id", "supplierName", "supplierCode"],
      where: { flag: 1 },
      include: [
        {
          model: DeliveryNote,
          required: true,
          where: whereConditionDn,
          include: [
            {
              model: Incoming,
              required: true,
              attributes: [
                "id",
                "planning",
                "actual",
                "status",
                "incomingDate",
              ],
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
                              attributes: ["id", "plantName", "warehouseId"],
                              where: whereConditionPlant,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: LogImport,
              required: true,
              attributes: ["id", "typeLog", "fileName", "importDate"],
              include: [
                {
                  model: User,
                  required: true,
                  attributes: ["id", "username"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    // mapping data
    const mappedData = data.flatMap((item) => {
      return item.Delivery_Notes.map((dn) => {
        // Pastikan arrivalActualTime adalah string
        const actualTime = dn.arrivalActualTime
          ? new Date(dn.arrivalActualTime).toISOString().slice(11, 19)
          : "00:00:00"; // Default value jika null atau undefined

        // Pastikan arrivalPlanTime adalah string
        const plannedTime = dn.arrivalPlanTime
          ? new Date(dn.arrivalPlanTime).toISOString().slice(11, 19)
          : "00:00:00"; // Default value jika null atau undefined

        // Gabungkan date dan time
        const actualArrival = new Date(`${dn.arrivalActualDate}T${actualTime}`);
        const plannedArrival = new Date(`${dn.arrivalPlanDate}T${plannedTime}`);

        // Hitung delay dalam milidetik
        const delay = actualArrival - plannedArrival;

        const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD

        return {
          dnNumber: dn.dnNumber,
          supplierName: item.supplierName,
          supplierCode: item.supplierCode,
          truckStation: dn.truckStation,
          rit: dn.rit,
          arrivalPlanDate: dn.arrivalPlanDate,
          arrivalPlanTime: dn.arrivalPlanTime
            ? new Date(dn.arrivalPlanTime).toISOString().slice(11, 16)
            : "00:00",
          departurePlanDate: dn.departurePlanDate,
          departurePlanTime: dn.departurePlanTime
            ? new Date(dn.departurePlanTime).toISOString().slice(11, 16)
            : "00:00",
          arrivalActualDate: dn.arrivalActualDate,
          departureActualDate: dn.departureActualDate,
          arrivalActualTime: dn.arrivalActualTime
            ? new Date(dn.arrivalActualTime).toISOString().slice(11, 16)
            : null,
          departureActualTime: dn.departureActualTime
            ? new Date(dn.departureActualTime).toISOString().slice(11, 16)
            : null,
          status: dn.status,
          delayTime: delay > 0 ? convertDelay(delay) : "0s",
          warehouseId:
            dn.Incomings?.[0]?.Inventory?.Address_Rack?.Storage?.Plant
              ?.warehouseId,
          Materials: dn.Incomings.map((incoming) => ({
            incomingId: incoming.id,
            materialNo: incoming.Inventory.Material.materialNo,
            description: incoming.Inventory.Material.description,
            uom: incoming.Inventory.Material.uom,
            address: incoming.Inventory.Address_Rack.addressRackName,
            reqQuantity: incoming.planning,
            receivedQuantity: incoming.actual,
            remain: incoming.actual - incoming.planning,
            status: incoming.status,
            viewOnly: today > incoming.incomingDate,
          })),
        };
      });
    });

    res
      .status(200)
      .json({ data: mappedData, message: "Data Delivery Note Found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateQuantityDN = async (req, res) => {
  const transaction = await db.transaction(); // Inisialisasi transaksi

  try {
    const { incomingIds, quantities } = req.body;
    const userId = req.user.userId;

    // Validasi required
    if (!Array.isArray(incomingIds) || !Array.isArray(quantities)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Incoming IDs and quantities must be arrays",
      });
    }

    if (incomingIds.length === 0 || quantities.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Incoming IDs and quantities cannot be empty",
      });
    }

    if (incomingIds.length !== quantities.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Incoming IDs and quantities array lengths do not match",
      });
    }

    // Looping untuk update satu per satu
    for (let i = 0; i < incomingIds.length; i++) {
      const incomingId = incomingIds[i];
      const quantity = Number(quantities[i]);

      if (isNaN(quantity)) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Invalid quantity at index ${i}`,
        });
      }

      try {
        // Tangkap error dari `processIncomingUpdate`
        await processIncomingUpdate(incomingId, quantity, userId, transaction);
      } catch (error) {
        await transaction.rollback();
        return res.status(400).json({ message: error.message }); // Return error validasi
      }
    }

    await transaction.commit();
    res.status(200).json({ message: "Delivery Note Updated" });
  } catch (error) {
    await transaction.rollback(); // Rollback jika terjadi error sistem
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getArrivalMonitoring = async (req, res) => {
  try {
    const { plantId, status, vendorId, startDate, endDate } = req.query;

    let whereConditionDn = {};
    let whereConditionSupplier = { flag: 1 };
    let whereConditionPlant = { flag: 1 };

    if (plantId) {
      whereConditionPlant.plantId = plantId;
    }

    if (vendorId) {
      whereConditionSupplier.supplierId = vendorId;
    }

    if (startDate && endDate) {
      whereConditionDn.arrivalPlanDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (status) {
      whereConditionDn.status = status;
    }

    const data = await DeliveryNote.findAll({
      where: whereConditionDn,
      include: [
        {
          model: Incoming,
          required: false,
          attributes: ["id"],
          include: [
            {
              model: Inventory,
              required: false,
              attributes: ["id"],
              include: [
                {
                  model: Material,
                  required: true,
                  attributes: ["id"],
                  where: whereConditionSupplier,
                },
                {
                  model: AddressRack,
                  required: false,
                  attributes: ["id"],
                  where: { flag: 1 },
                  include: [
                    {
                      model: Storage,
                      required: true,
                      attributes: ["id"],
                      where: whereConditionPlant,
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
      return res.status(404).json({ message: "Data Delivery Note Not Found" });
    }

    // Mengelompokkan data berdasarkan status
    const summary = {
      delayed: data.filter((item) => item.status === "delayed").length,
      onSchedule: data.filter((item) => item.status === "on schedule").length,
      total: data.length,
    };

    // Menghitung data yang tersisa
    summary.remaining = summary.total - (summary.delayed + summary.onSchedule);

    return res
      .status(200)
      .json({ data: summary, message: "Data Delivery Note Found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getArrivalChart = async (req, res) => {
  try {
    const { plantId, startDate, endDate } = req.query;

    let whereConditionDn = {};
    let whereConditionSupplier = { flag: 1 };
    let whereConditionPlant = { flag: 1 };

    if (plantId) {
      whereConditionPlant.plantId = plantId;
    }

    if (startDate && endDate) {
      whereConditionDn.arrivalPlanDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    // if (status) {
    //   whereConditionDn.status = status;
    // }

    const includeDn = [
      {
        model: DeliverySchedule,
        required: false,
        where: { flag: 1 },
      },
      {
        model: DeliveryNote,
        required: true,
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
                attributes: ["id"],
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
                    include: [
                      {
                        model: Storage,
                        required: true,
                        attributes: ["id"],
                        where: whereConditionPlant,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const data = await Supplier.findAll({
      where: whereConditionSupplier,
      order: [
        ["Delivery_Schedules", "arrival", "ASC"],
        [
          "Delivery_Notes",
          "Incomings",
          "Inventory",
          "Address_Rack",
          "addressRackName",
          "ASC",
        ],
      ],
      include: includeDn,
      distinct: true,
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Data Delivery Note Not Found" });
    }

    // return res.status(200).json({ data, message: "Data Delivery Note Found" });

    const totalIncomingMaterials = data.reduce((total, item) => {
      return (
        total +
        (item.Delivery_Notes || []).reduce((dnTotal, dn) => {
          return dnTotal + ((dn.Incomings || []).length || 0);
        }, 0)
      );
    }, 0);

    const totalPartialIncomings = data.reduce((total, item) => {
      return (
        total +
        (item.Delivery_Notes || []).reduce((dnTotal, dn) => {
          return (
            dnTotal +
            (dn.Incomings || []).filter(
              (incoming) => incoming.status === "partial"
            ).length
          );
        }, 0)
      );
    }, 0);

    const totalNotCompleteIncomings = data.reduce((total, item) => {
      return (
        total +
        (item.Delivery_Notes || []).reduce((dnTotal, dn) => {
          return (
            dnTotal +
            (dn.Incomings || []).filter(
              (incoming) => incoming.status === "not complete"
            ).length
          );
        }, 0)
      );
    }, 0);

    const totalCompletedIncomings = data.reduce((total, item) => {
      return (
        total +
        (item.Delivery_Notes || []).reduce((dnTotal, dn) => {
          return (
            dnTotal +
            (dn.Incomings || []).filter(
              (incoming) => incoming.status === "completed"
            ).length
          );
        }, 0)
      );
    }, 0);

    const mappedData = data.flatMap((item) => {
      const tanggal = new Date(item.Delivery_Notes[0].arrivalPlanDate);
      const day = tanggal.getDay();

      // Filter berdasarkan hari
      const schedules =
        item.Delivery_Schedules?.filter((s) => s.schedule === day) || [];

      // Jika tidak ada schedules, tampilkan vendor dengan status 'no schedule'
      if (schedules.length === 0) {
        return [
          {
            vendorId: item.supplierId,
            vendorCode: item.supplierCode,
            vendorName: item.supplierName,
            truckStation: null,
            rit: null,
            arrivalPlanDate: item.Delivery_Notes[0]?.arrivalPlanDate || null, // Antisipasi jika null
            arrivalPlanTime: null,
            departurePlanTime: null,
            departureActualTime: null,
            arrivalActualDate: null,
            arrivalActualTime: null,
            status: "no schedule",
          },
        ];
      }

      // Map data berdasarkan jumlah schedules
      return schedules.map((ds) => {
        let status = "scheduled";

        // filter data Delivery Note yang cocok
        const deliveryNotes =
          item.Delivery_Notes?.filter(
            (dn) => dn.supplierId === ds.supplierId && dn.rit === ds.rit
          ) || [];

        const planArrivalTime = new Date(ds.arrival)
          .toISOString()
          .slice(11, 16);

        const plannedArrival = new Date(
          `${item.Delivery_Notes[0].arrivalPlanDate}T${planArrivalTime}`
        );

        // Calculate delay with tolerance
        const delay = new Date() - plannedArrival - tolerance;

        if (delay > 0) {
          status = "delayed";
        }

        let totalComplete = 0;
        let totalMaterials = 0;

        deliveryNotes.forEach((dn) => {
          const completeMaterials = dn?.Incomings?.filter(
            (inc) => inc.status === "completed"
          );

          totalComplete += completeMaterials?.length || 0;
          totalMaterials += dn?.Incomings?.length || 0;
        });

        // Format hasil statusMaterial
        const statusMaterial = `${totalComplete} / ${totalMaterials}`;

        return {
          vendorId: item.supplierId,
          vendorCode: item.supplierCode,
          vendorName: item.supplierName,
          truckStation: ds.truckStation,
          rit: ds.rit,
          arrivalPlanDate: item.Delivery_Notes[0]?.arrivalPlanDate || null, // Antisipasi jika null
          arrivalPlanTime: new Date(ds.arrival).toISOString().slice(11, 16),
          departurePlanTime: new Date(ds.departure).toISOString().slice(11, 16),
          departureActualTime: deliveryNotes[0]?.departureActualTime
            ? new Date(deliveryNotes[0]?.departureActualTime)
                .toISOString()
                .slice(11, 16)
            : null,
          arrivalActualDate: deliveryNotes[0]?.arrivalActualDate || null,
          arrivalActualTime: deliveryNotes[0]?.arrivalActualTime
            ? new Date(deliveryNotes[0]?.arrivalActualTime)
                .toISOString()
                .slice(11, 16)
            : null,
          statusMaterial: statusMaterial,
          status: deliveryNotes[0]?.status || status,
          deliveryNotes: deliveryNotes?.map((dn) => {
            return {
              dnNumber: dn.dnNumber,
              Materials: dn.Incomings?.map((inc) => {
                return {
                  incomingId: inc.id,
                  dnNumber: dn.dnNumber,
                  materialNo: inc.Inventory.Material.materialNo,
                  description: inc.Inventory.Material.description,
                  uom: inc.Inventory.Material.uom,
                  address: inc.Inventory.Address_Rack.addressRackName,
                  reqQuantity: inc.planning,
                  actQuantity: inc.actual,
                  remain: inc.planning - inc.actual,
                  status: inc.status,
                };
              }),
            };
          }),
        };
      });
    });

    // Sorting the mapped data by arrivalPlanTime
    mappedData.sort((a, b) => {
      const timeA = a.arrivalPlanTime ? new Date(a.arrivalPlanTime) : null;
      const timeB = b.arrivalPlanTime ? new Date(b.arrivalPlanTime) : null;

      // Jika salah satu atau kedua nilai null, letakkan di bagian bawah
      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1; // a lebih besar, letakkan di bawah
      if (timeB === null) return -1; // b lebih besar, letakkan di bawah

      // Jika keduanya ada, bandingkan berdasarkan waktu
      return timeA - timeB;
    });

    // Return sorted data
    return res.status(200).json({
      data: mappedData,
      summaryMaterial: {
        completed: totalCompletedIncomings,
        notCompleted: totalPartialIncomings,
        notDelivered: totalNotCompleteIncomings,
        total: totalIncomingMaterials,
      },
      message: "Data Delivery Note Found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Konversi delay ke format yang lebih mudah dibaca
const convertDelay = (delayMs) => {
  const seconds = Math.abs(delayMs) / 1000;
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (remainingSeconds > 0 && result === "") result += `${remainingSeconds}s`; // Tampilkan detik jika tidak ada yang lain

  return result.trim() || "0s"; // Jika tidak ada delay, tampilkan "0s"
};

export const updateStatusToDelayed = async (dnNumber) => {
  try {
    if (!dnNumber) {
      throw new Error("Delivery Note number is required");
    }

    const deliveryNote = await DeliveryNote.findOne({
      where: { dnNumber: dnNumber },
    });

    if (!deliveryNote) {
      throw new Error("Delivery Note not found");
    }

    // jika status sudah delayed tidak bisa di update
    if (deliveryNote.status === "delayed") {
      throw new Error("Delivery Note is already delayed");
    }

    // status harus scheduled
    if (deliveryNote.status !== "scheduled") {
      throw new Error("Delivery Note is not scheduled");
    }

    deliveryNote.status = "delayed";
    await deliveryNote.save();

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDnChartHistory = async (req, res) => {
  try {
    const { plantId, month, year } = req.query;

    let whereConditionPlant = { flag: 1 };
    let whereConditionIncomingHistory = {};

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    // Filter berdasarkan bulan dan tahun jika ada
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`; // Tanggal awal bulan
      const endDate = new Date(year, month, 1).toISOString().slice(0, 10); // Tanggal akhir bulan

      whereConditionIncomingHistory.incomingDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const data = await IncomingHistory.findAll({
      where: whereConditionIncomingHistory,
      include: [
        {
          model: Incoming,
          required: true,
          attributes: ["id", "planning", "actual", "status", "incomingDate"],
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
                          attributes: ["id", "plantName", "warehouseId"],
                          where: whereConditionPlant,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: DeliveryNote,
              required: true,
              include: [
                {
                  model: Supplier,
                  required: true,
                  attributes: ["id", "supplierName", "supplierCode"],
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
      ],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    // Grouping dan Counting berdasarkan incomingDate
    const groupedData = data.reduce((acc, item) => {
      const incomingDate = item.incomingDate;
      const status = item.status;

      if (!acc[incomingDate]) {
        acc[incomingDate] = {
          date: incomingDate,
          items: [],
          statusCount: {
            partial: 0,
            completed: 0,
            notComplete: 0,
          },
        };
      }

      // Tambahkan item ke grup yang sesuai
      acc[incomingDate].items.push(item);

      // Hitung berdasarkan status
      if (status === "partial") {
        acc[incomingDate].statusCount.partial += 1;
      } else if (status === "completed") {
        acc[incomingDate].statusCount.completed += 1;
      } else if (status === "not complete") {
        acc[incomingDate].statusCount.notComplete += 1;
      }

      return acc;
    }, {});

    // Konversi menjadi array dan hitung jumlah item per tanggal
    const result = Object.values(groupedData).map((group) => ({
      incomingDate: group.date,
      itemCount: group.items.length,
      partialCount: group.statusCount.partial,
      completedCount: group.statusCount.completed,
      notDeliveredCount: group.statusCount.notComplete,
    }));

    // Grouping dan Counting berdasarkan supplier
    const groupedDataSupplier = data.reduce((acc, item) => {
      const status = item.status;
      const supplierId = item.Incoming.Delivery_Note.supplierId;
      const supplierCode = item.Incoming.Delivery_Note.Supplier.supplierCode;
      const supplierName = item.Incoming.Delivery_Note.Supplier.supplierName;

      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplierId: supplierId,
          supplierCode: supplierCode,
          supplierName: supplierName,
          items: [],
          statusCount: {
            partial: 0,
            completed: 0,
            notComplete: 0,
          },
        };
      }

      // Tambahkan item ke grup yang sesuai
      acc[supplierId].items.push(item);

      // Hitung berdasarkan status
      if (status === "partial") {
        acc[supplierId].statusCount.partial += 1;
      } else if (status === "completed") {
        acc[supplierId].statusCount.completed += 1;
      } else if (status === "not complete") {
        acc[supplierId].statusCount.notComplete += 1;
      }

      return acc;
    }, {});

    // Konversi menjadi array dan hitung jumlah item per supplier
    const resultSupplier = Object.values(groupedDataSupplier).map((group) => ({
      supplierCode: group.supplierCode,
      supplierName: group.supplierName,
      itemCount: group.items.length,
      partialCount: group.statusCount.partial,
      completedCount: group.statusCount.completed,
      notDeliveredCount: group.statusCount.notComplete,
    }));

    // sort result by incomingDate
    result.sort((a, b) => {
      const dateA = new Date(a.incomingDate);
      const dateB = new Date(b.incomingDate);
      return dateA - dateB;
    });

    // sort resultSupplier by notDeliveredCount
    resultSupplier.sort((a, b) => b.notDeliveredCount - a.notDeliveredCount);

    res.status(200).json({
      data: { byDate: result, bySupplier: resultSupplier },
      message: "Data Delivery Note Found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
