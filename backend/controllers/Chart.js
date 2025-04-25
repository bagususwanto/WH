import Sequelize from "sequelize";
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
      whereConditionSupplier.status = status;
    }

    const data = await Supplier.findAll({
      where: whereConditionSupplier,
      order: [["Delivery_Schedules", "arrival", "ASC"]],
      include: [
        {
          model: DeliverySchedule,
          required: true,
          where: whereConditionDeliverySchedule,
          include: [
            {
              model: Plant,
              required: true,
              attributes: ["id", "plantName"],
              where: { flag: 1 },
            },
          ],
        },
        {
          model: VendorMovement,
          required: false,
          where: whereConditionVendorMovement,
          include: [
            {
              model: DeliveryNote,
              required: false,
              through: { attributes: [] },
            },
          ],
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

    const mappedData = data.flatMap((item) =>
      item.Delivery_Schedules.map((ds) => {
        // data actual berdasarkan supplierId, movementDate, rit, plantId
        const actualData = item.Vendor_Movements.find(
          (vm) =>
            vm.supplierId === ds.supplierId &&
            vm.movementDate === currDate.toISOString().split("T")[0] &&
            vm.rit === ds.rit &&
            vm.plantId === ds.plantId
        );

        return {
          actualData: actualData || null,
          id: item.id,
          planTime: `${formatTime(ds.arrival)} - ${formatTime(ds.departure)}`,
          vendorName: item.supplierName,
          truckStation: ds.truckStation,
          rit: ds.rit,
          plantName: ds.Plant.plantName,
          arrivedTime: actualData?.arrivalActualTime || null,
          status: actualData?.status || "scheduled",
        };
      })
    );

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
