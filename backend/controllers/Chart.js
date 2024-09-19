import Sequelize from "sequelize";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";

const { Op } = Sequelize;

export const getInventoryDashboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default top 10
    const order = req.query.order || "ASC";
    const oprt = req.query.oprt || "gt"; // Operator: default gt (greater than), lt (less than), eq (equal to)
    const value = parseFloat(req.query.value) || 0; // Value, default 0
    const status = req.query.status || "critical";

    let rumus;
    let whereCondition;
    let operator;

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

    if (status === "critical") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / CAST("Material"."minStock" AS FLOAT) * 2), 2)`;
    } else if (status === "lowest") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / CAST("Material"."minStock" AS FLOAT)), 2)`;
    } else if (status === "overflow") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / CAST("Material"."maxStock" AS FLOAT)), 2)`;
    } else {
      return res.status(400).send({
        status: "error",
        message: "Invalid status",
      });
    }

    // Determining dynamic length for truncation based on your conditions
    const dynamicLength = 17; // Set this to any dynamic value you need, or compute based on conditions

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
      include: [
        {
          model: Material,
          attributes: [
            "materialNo",
            "uom",
            "description",
            "minStock",
            "maxStock",
          ],
          where: {
            minStock: {
              [Op.ne]: null, // Ensure minStock is not NULL
            },
          },
        },
      ],
      where: whereCondition,
      attributes: [
        [Sequelize.literal(`LEFT("Material"."description", ${dynamicLength})`), "name"], // Use dynamicLength here
        [Sequelize.literal(rumus), "stock"], // Calculate stock using dynamic formula
        "quantityActualCheck",
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
      ],
      limit, // Limit number of results
    });

    res.json(inventoryData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
