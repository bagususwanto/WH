import Sequelize, { col, fn } from "sequelize";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import LogEntry from "../models/LogEntryModel.js";
import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import VendorMovement from "../models/VendorMovementModel.js";
import DeliveryNote from "../models/DeliveryNoteModel.js";
import IncomingHistory from "../models/IncomingHistoryModel.js";

const { Op } = Sequelize;
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0); // Mengatur waktu ke 00:00:00

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999); // Mengatur waktu ke 23:59:59

// today - 7 hours
// const today = new Date(new Date().getTime() - 7 * 60 * 60 * 1000)
//   .toISOString()
//   .split("T")[0];

// const today = new Date().toLocaleDateString("en-CA"); // Format 'YYYY-MM-DD'
// const today = new Date().toISOString().split("T")[0];

export const getInventoryDashboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default top 10
    const order = req.query.order || "ASC";
    const oprt = req.query.oprt || "gt"; // Operator: default gt (greater than), lt (less than), eq (equal to)
    const value = parseFloat(req.query.value) || 0; // Value, default 0
    const status = req.query.status || "critical";
    const plant = req.query.plant || null;

    const today = new Date().toISOString().split("T")[0];

    let rumus;
    let rumus2;
    let incoming_plan;
    let whereCondition;
    let operator;
    let whereConditionPlant;

    if (
      (!req.query.oprt && req.query.value) ||
      (req.query.oprt && !req.query.value)
    ) {
      return res.status(400).send({
        status: "error",
        message: "Invalid operator or value",
      });
    }

    if (oprt === "gt") {
      operator = ">";
    } else if (oprt === "lt") {
      operator = "<";
    } else if (oprt === "eq") {
      operator = "=";
    } else {
      return res.status(400).send({
        status: "error",
        message: "Invalid operator or value",
      });
    }

    if (plant == "all") {
      whereConditionPlant = {
        flag: 1,
      };
    } else if (!isNaN(plant)) {
      whereConditionPlant = {
        id: parseInt(plant),
        flag: 1,
      };
    } else {
      return res.status(400).json({ message: "Invalid plant" });
    }

    incoming_plan = `(
      SELECT TOP 1 "planning"
      FROM "Incoming" AS "Incoming"
      WHERE "Incoming"."inventoryId" = "Inventory"."id"
      ORDER BY "Incoming"."createdAt" DESC
      
    )`;
    if (status === "critical") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0) * 2.5), 2)`;
      rumus2 = `ROUND((CAST((${incoming_plan}) AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0) * 2.5), 2)`;
    } else if (status === "lowest") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0)), 2)`;
      rumus2 = `ROUND((CAST((${incoming_plan}) AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0)), 2)`;
    } else if (status === "overflow") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / NULLIF(CAST("Material"."maxStock" AS FLOAT), 0)), 2)`;
      rumus2 = `ROUND((CAST((${incoming_plan}) AS FLOAT) / NULLIF(CAST("Material"."maxStock" AS FLOAT), 0)), 2)`;
    }

    // Determining dynamic length for truncation based on your conditions
    const dynamicLength = 22; // Set this to any dynamic value you need, or compute based on conditions

    // Determining whereCondition based on status
    if (status === "critical" || status === "lowest") {
      whereCondition = {
        [Op.or]: [
          { quantityActualCheck: 0 }, // Include if quantityActualCheck is 0
          {
            [Op.and]: [
              {
                quantityActualCheck: {
                  [Op.lt]: Sequelize.col("Material.minStock"), // Include if quantityActualCheck < minStock
                },
              },
              Sequelize.literal(`${rumus} ${operator} ${value}`),
            ],
          },
        ],
      };
    } else if (status === "overflow") {
      whereCondition = {
        [Op.and]: [
          {
            quantityActualCheck: {
              [Op.ne]: null, // Ensure quantityActualCheck is not NULL
              [Op.gt]: Sequelize.col("Material.maxStock"), // quantityActualCheck greater than maxStock
            },
          },
          Sequelize.literal(`${rumus} ${operator} ${value}`), // Dynamic condition
        ],
      };
    }

    // Query to get inventory with critical conditions
    const inventoryData = await Inventory.findAll({
      attributes: ["id", "quantityActualCheck"],
      include: [
        {
          model: Material,
          attributes: [
            "materialNo",
            "uom",
            "description",
            "minStock",
            "maxStock",
            "supplierId",
            "type",
          ],
          include: [
            {
              model: Supplier,
              required: false,
              attributes: ["supplierName"],
            },
          ],
          where: {
            minStock: {
              [Op.ne]: null, // Ensure minStock is not NULL
            },
            type: "direct",
          },
        },
        {
          model: Incoming,
          required: false,
          limit: 1,
          order: [
            [
              Sequelize.literal(
                `CASE WHEN incomingDate = '${today}' THEN 0 ELSE 1 END`
              ),
              "ASC",
            ],
            ["incomingDate", "ASC"],
          ],
          where: {
            [Op.or]: [
              { incomingDate: today }, // Sama dengan hari ini
              { incomingDate: { [Op.gt]: today } }, // Lebih besar dari hari ini
            ],
          },
        },
        {
          model: AddressRack,
          where: { flag: 1 },
          required: true,
          attributes: ["id"],
          include: [
            {
              model: Storage,
              attributes: ["id"],
              required: true,
              include: [
                {
                  model: Plant,
                  attributes: ["id", "plantName"],
                  required: true,
                  where: whereConditionPlant,
                },
              ],
            },
          ],
        },
        {
          model: LogEntry,
          attributes: ["createdAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
          required: false,
        },
      ],
      where: whereCondition,
      attributes: [
        [
          Sequelize.literal(`LEFT("Material"."materialNO", ${dynamicLength})`),
          "name",
        ], // Use dynamicLength here
        [Sequelize.literal(rumus), "stock"], // Calculate stock using dynamic formula
        "quantityActualCheck",
        [Sequelize.literal(`(${rumus}) + (${rumus2})`), "estimatedStock"], // Add rumus and rumus2 to get the totalStock
      ],
      order: [[Sequelize.literal("stock"), order]], // Sort by calculated stock
      group: [
        "Inventory.id", // Include Inventory ID in GROUP BY
        "Inventory.quantityActualCheck", // Include quantityActualCheck in GROUP BY
        "Material.id", // Group by Material ID
        "Material.description",
        "Material.uom", // Group by Material uom
        "Material.minStock", // Group by minStock
        "Material.maxStock", // Group by maxStock
        "Material.materialNo", // Group by materialNo
        "Material.supplierId", // Group by supplierId
        "Material.type",
        "Material->Supplier.id",
        "Material->Supplier.supplierName",
        "Address_Rack.id", // Group by Address Rack ID
        "Address_Rack->Storage.id", // Group by Storage ID
        "Address_Rack->Storage->Plant.id",
        "Address_Rack->Storage->Plant.plantName",
      ],
      limit, // Limit number of results
    });

    if (inventoryData.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(inventoryData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function timeStringToMinutes(str) {
  const [hours, minutes] = str.split(":").map(Number);
  return hours * 60 + minutes;
}

export const getArrivalMonitoring = async (req, res) => {
  try {
    const { plantId, status, vendorId } = req.query;
    const currDate = new Date();
    const day = currDate.getDay();

    let whereConditionVendorMovement = {
      movementDate: currDate.toDateString("en-CA"),
    };
    let whereConditionSupplier = { flag: 1 };
    let whereConditionDeliverySchedule = { schedule: day, flag: 1 };

    if (plantId) {
      whereConditionDeliverySchedule.plantId = plantId;
    }

    if (status) {
      whereConditionVendorMovement.status = status;
    }

    if (vendorId) {
      whereConditionDeliverySchedule.supplierId = vendorId;
    }

    const data = await DeliverySchedule.findAll({
      where: whereConditionDeliverySchedule,
      order: [["arrival", "ASC"]],
      include: [
        {
          model: Supplier,
          required: true,
          where: { flag: 1 },
          include: [
            {
              model: VendorMovement,
              required: false,
              where: whereConditionVendorMovement,
              include: [
                {
                  model: DeliveryNote,
                  attributes: ["id", "completeItems", "totalItems"],
                  required: false,
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
        {
          model: Plant,
          required: true,
          attributes: ["id", "plantName"],
          where: { flag: 1 },
        },
      ],
    });

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "Data Vendor Arrival Monitoring Not Found" });
    }

    // return res
    //   .status(200)
    //   .json({ data, message: "Data Vendor Arrival Monitoring Found" });

    const mappedData = data.map((item) => {
      // data actual berdasarkan supplierId, movementDate, rit, plantId
      const actualData = item.Supplier.Vendor_Movements.find(
        (vm) =>
          vm.supplierId === item.supplierId &&
          vm.movementDate === currDate.toISOString().split("T")[0] &&
          vm.rit === item.rit &&
          vm.truckStation === item.truckStation &&
          vm.plantId === item.plantId
      );

      const sumCompleteItems = actualData?.Delivery_Notes?.reduce(
        (sum, note) => sum + note.completeItems,
        0
      );

      const sumTotalItems = actualData?.Delivery_Notes?.reduce(
        (sum, note) => sum + note.totalItems,
        0
      );

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const minutesNow = hours * 60 + minutes;

      const arrival = new Date(item.arrival);
      const arrivalHours = arrival.getUTCHours();
      const arrivalMinutes = arrival.getUTCMinutes();
      const arrivalMinutesTotal = arrivalHours * 60 + arrivalMinutes;

      const isDelayed = arrivalMinutesTotal  < minutesNow;
      const status = isDelayed ? "delayed" : "scheduled";

      return {
        id: item.id,
        planTime: `${formatTime(item.arrival)} - ${formatTime(item.departure)}`,
        supplierId: item.supplierId,
        vendorName: item.Supplier.supplierName,
        truckStation: item.truckStation,
        rit: item.rit,
        plantName: item.Plant.plantName,
        arrivedTime: actualData?.arrivalActualTime || null,
        completeItems: sumCompleteItems ?? null,
        totalItems: sumTotalItems ?? null,
        status: actualData?.status || status,
      };
    });

    // Return sorted data
    return res.status(200).json({
      data: mappedData,
      message: "Data Vendor Arrival Monitoring Found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const formatTime = (time) => {
  if (!(time instanceof Date)) return "";
  const hours = time.getUTCHours().toString().padStart(2, "0");
  const minutes = time.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getDnChartHistory = async (req, res) => {
  try {
    const { plantId, month, year } = req.query;

    let whereConditionStorage = {};
    let whereConditionIncomingHistory = {};

    if (plantId) {
      whereConditionStorage.plantId = plantId;
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
                  attributes: ["id"],
                  include: [
                    {
                      model: Storage,
                      required: true,
                      where: whereConditionStorage,
                      attributes: ["id", "plantId"],
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

export const getDailyMaterialsArrive = async (req, res) => {
  const { date, plantId } = req.query;
  let whereConditionIncoming = {};
  let whereConditionStorage = { flag: 1 };

  if (date) {
    whereConditionIncoming.incomingDate = date;
  }

  if (plantId) {
    whereConditionStorage.plantId = plantId;
  }

  try {
    const data = await Incoming.findAll({
      where: whereConditionIncoming,
      attributes: ["status", [fn("COUNT", col("status")), "total"]],
      include: [
        {
          model: Inventory,
          required: true,
          attributes: [],
          include: [
            {
              model: AddressRack,
              required: true,
              attributes: [],
              include: [
                {
                  model: Storage,
                  required: true,
                  where: whereConditionStorage,
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
      group: ["Incoming.status"],
    });

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "Data Material Arrive Not Found" });
    }

    // Hitung total semua status
    const totalAll = data.reduce(
      (sum, item) => sum + parseInt(item.dataValues.total),
      0
    );

    return res.status(200).json({
      data: {
        statusCount: data,
        totalAll: totalAll,
      },
      message: "Data Material Arrive Found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
