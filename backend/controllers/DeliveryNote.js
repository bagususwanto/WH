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
        departurePlanDate:
          item.Materials[0].Inventory.Incomings[0].Delivery_Note
            .departurePlanDate,
        departurePlanTime: new Date(schedule.departure)
          .toISOString()
          .slice(11, 16),
        arrivalActualDate:
          item.Materials[0].Inventory.Incomings[0].Delivery_Note
            .arrivalActualDate,
        departureActualDate:
          item.Materials[0].Inventory.Incomings[0].Delivery_Note
            .departureActualDate,
        arrivalActualTime: item.Materials[0].Inventory.Incomings[0]
          .Delivery_Note.arrivalActualTime
          ? new Date(
              item.Materials[0].Inventory.Incomings[0].Delivery_Note.arrivalActualTime
            )
              .toISOString()
              .slice(11, 16)
          : null,
        departureActualTime: item.Materials[0].Inventory.Incomings[0]
          .Delivery_Note.departureActualTime
          ? new Date(
              item.Materials[0].Inventory.Incomings[0].Delivery_Note.departureActualTime
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

    const data = await DeliveryNote.findAll({
      where: whereConditionDn,
      order: [["arrivalPlanTime", "ASC"]],
      include: [
        {
          model: Incoming,
          required: false,
          attributes: ["id", "planning", "actual", "status", "incomingDate"],
          include: [
            {
              model: Inventory,
              required: false,
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
                    },
                  ],
                },
                {
                  model: AddressRack,
                  required: false,
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
    });

    if (!data) {
      return res.status(404).json({ message: "Delivery Note Not Found" });
    }

    // mapping data
    const mappedData = data.map((item) => {
      // Pastikan arrivalActualTime adalah string
      const actualTime = item.arrivalActualTime
        ? new Date(item.arrivalActualTime).toISOString().slice(11, 19) // Konversi ke ISO string dan ambil bagian waktu
        : "00:00:00"; // Default value jika null atau undefined

      // Pastikan arrivalPlanTime adalah string
      const plannedTime = item.arrivalPlanTime
        ? new Date(item.arrivalPlanTime).toISOString().slice(11, 19) // Konversi ke ISO string dan ambil bagian waktu
        : "00:00:00"; // Default value jika null atau undefined

      // Gabungkan date dan time
      const actualArrival = new Date(`${item.arrivalActualDate}T${actualTime}`);
      const plannedArrival = new Date(`${item.arrivalPlanDate}T${plannedTime}`);

      // Hitung delay dalam milidetik
      const delay = actualArrival - plannedArrival;

      const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD

      const deliveryNotes = {
        dnNumber: item.dnNumber,
        supplierName:
          item.Incomings[0].Inventory.Material.Supplier.supplierName,
        supplierCode:
          item.Incomings[0].Inventory.Material.Supplier.supplierCode,
        truckStation: item.truckStation,
        rit: item.rit,
        arrivalPlanDate: item.arrivalPlanDate,
        arrivalPlanTime: new Date(item.arrivalPlanTime)
          .toISOString()
          .slice(11, 16),
        departurePlanDate: item.departurePlanDate,
        departurePlanTime: new Date(item.departurePlanTime)
          .toISOString()
          .slice(11, 16),
        arrivalActualDate: item.arrivalActualDate,
        departureActualDate: item.departureActualDate,
        arrivalActualTime: item.arrivalActualTime
          ? new Date(item.arrivalActualTime).toISOString().slice(11, 16)
          : null,
        departureActualTime: item.departureActualTime
          ? new Date(item.departureActualTime).toISOString().slice(11, 16)
          : null,
        status: item.status,
        delayTime: delay > 0 ? convertDelay(delay) : "0s",
        warehouseId:
          item.Incomings[0].Inventory.Address_Rack.Storage.Plant.warehouseId,
        Materials: item.Incomings.map((incoming) => ({
          incomingId: incoming.id,
          materialNo: incoming.Inventory.Material.materialNo,
          description: incoming.Inventory.Material.description,
          uom: incoming.Inventory.Material.uom,
          address: incoming.Inventory.Address_Rack.addressRackName,
          reqQuantity: incoming.planning,
          receivedQuantity: incoming.actual,
          remain: incoming.actual - incoming.planning,
          status: incoming.status,
          viewOnly: today > incoming.incomingDate ? true : false,
        })),
      };

      return {
        deliveryNotes,
      };
    });

    res
      .status(200)
      .json({ data: mappedData, message: "Data Delivery Note Found" });
  } catch (error) {
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

    if (!data) {
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
    const { plantId, status, startDate, endDate } = req.query;

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

    if (status) {
      whereConditionDn.status = status;
    }

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
      order: [["Delivery_Schedules", "arrival", "ASC"]],
      include: includeDn,
      distinct: true,
    });

    if (!data) {
      return res.status(404).json({ message: "Data Delivery Note Not Found" });
    }

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
            arrivalActualDate: null,
            arrivalActualTime: null,
            status: "no schedule",
          },
        ];
      }

      // Map data berdasarkan jumlah schedules
      return schedules.map((ds) => {
        let status = "scheduled";

        // Cari data Delivery Note yang cocok
        const deliveryNote = item.Delivery_Notes.find(
          (dn) => dn.supplierId === ds.supplierId && dn.rit === ds.rit
        );

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

        return {
          vendorId: item.supplierId,
          vendorCode: item.supplierCode,
          vendorName: item.supplierName,
          truckStation: ds.truckStation,
          rit: ds.rit,
          arrivalPlanDate: item.Delivery_Notes[0]?.arrivalPlanDate || null, // Antisipasi jika null
          arrivalPlanTime: new Date(ds.arrival).toISOString().slice(11, 16),
          departurePlanTime: new Date(ds.departure).toISOString().slice(11, 16),
          arrivalActualDate: deliveryNote?.arrivalActualDate || null,
          arrivalActualTime: deliveryNote?.arrivalActualTime
            ? new Date(deliveryNote?.arrivalActualTime)
                .toISOString()
                .slice(11, 16)
            : null,
          status: deliveryNote?.status || status,
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
