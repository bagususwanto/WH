import Sequelize from "sequelize";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";

const { Op } = Sequelize;
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0); // Mengatur waktu ke 00:00:00

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999); // Mengatur waktu ke 23:59:59

export const getInventoryDashboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default top 10
    const order = req.query.order || "ASC";
    const oprt = req.query.oprt || "gt"; // Operator: default gt (greater than), lt (less than), eq (equal to)
    const value = parseFloat(req.query.value) || 0; // Value, default 0
    const status = req.query.status || "critical";
    const plant = req.query.plant || null;

    let rumus;
    let rumus2;
    let incoming_plan;
    let whereCondition;
    let operator;
    let whereConditionPlant;

    if ((!req.query.oprt && req.query.value) || (req.query.oprt && !req.query.value)) {
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
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0) * 4.5), 2)`;
      rumus2 = `ROUND((CAST((${incoming_plan}) AS FLOAT) / NULLIF(CAST("Material"."minStock" AS FLOAT), 0) * 4.5), 2)`;
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
        [Op.and]: [
          {
            quantityActualCheck: {
              [Op.ne]: null, // Ensure quantityActualCheck is not NULL
              [Op.or]: [
                { [Op.eq]: 0 }, // Include if quantityActualCheck is 0
                { [Op.lt]: Sequelize.col("Material.minStock") }, // Include if quantityActualCheck is less than minStock
              ],
            },
          },
          Sequelize.literal(`${rumus} ${operator} ${value}`), // Dynamic condition
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
          attributes: ["materialNo", "uom", "description", "minStock", "maxStock", "supplierId", "type"],
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
          },
        },
        {
          model: Incoming,
          required: false,
          limit: 1,
          order: [["createdAt", "DESC"]],
          where: {
            createdAt: {
              [Op.between]: [startOfToday, endOfToday],
            },
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
      ],
      where: whereCondition,
      attributes: [
        [Sequelize.literal(`LEFT("Material"."materialNO", ${dynamicLength})`), "name"], // Use dynamicLength here
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
