import Sequelize from "sequelize";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";

const { Op } = Sequelize;

export const getInventoryByHighCriticalStock = async (req, res) => {
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

    if (oprt == "gt") {
      operator = ">";
    } else if (oprt == "lt") {
      operator = "<";
    } else if (oprt == "eq") {
      operator = "=";
    }

    if (status === "critical") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / CAST("Material"."minStock" AS FLOAT) * 2), 2)`;
    } else if (status === "lowest") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / CAST("Material"."minStock" AS FLOAT)), 2)`;
    } else if (status === "overflow") {
      rumus = `ROUND((CAST(quantityActualCheck AS FLOAT) / CAST("Material"."maxStock" AS FLOAT)), 2)`;
    }

    // Menentukan rumus dan kondisi where berdasarkan status
    if (status == "critical" || status == "lowest") {
      // Kondisi where untuk status critical atau lowest
      whereCondition = {
        [Op.and]: [
          {
            quantityActualCheck: {
              [Op.ne]: null, // Pastikan quantityActualCheck tidak NULL
              [Op.lt]: Sequelize.col("Material.minStock"), // quantityActualCheck kurang dari minStock
            },
          },
          Sequelize.literal(`${rumus} ${operator} ${value}`), // Kondisi dinamis
        ],
      };
    } else if (status == "overflow") {
      // Kondisi where untuk status overflow
      whereCondition = {
        [Op.and]: [
          {
            quantityActualCheck: {
              [Op.ne]: null, // Pastikan quantityActualCheck tidak NULL
              [Op.gt]: Sequelize.col("Material.maxStock"), // quantityActualCheck lebih dari maxStock
            },
          },
          Sequelize.literal(`${rumus} ${operator} ${value}`), // Kondisi dinamis
        ],
      };
    }

    // Query untuk mendapatkan inventory dengan kondisi kritis
    const inventoryData = await Inventory.findAll({
      include: [
        {
          model: Material,
          attributes: ["materialNo", "description", "minStock", "maxStock"],
          where: {
            minStock: {
              [Op.ne]: null, // Pastikan minStock tidak NULL
            },
          },
        },
      ],
      where: whereCondition, // Kondisi where dengan operator dinamis
      attributes: [
        [Sequelize.literal(`LEFT("Material"."description", 20)`), "name"], // Nama material dari tabel Material, potong hingga 50 karakter
        [Sequelize.literal(`${rumus}`), "stock"],
      ],
      order: [[Sequelize.literal("stock"), order]], // Mengurutkan berdasarkan stok yang dihitung
      group: [
        "Inventory.id", // Tambahkan ID Inventory ke GROUP BY
        "Inventory.quantityActualCheck", // Tambahkan quantityActualCheck ke GROUP BY
        "Material.id", // Group by material ID
        "Material.description", // Group by material description
        "Material.minStock", // Group by minStock
        "Material.maxStock", // Group by maxStock
        "Material.materialNo", // Group by materialNo
      ],
      limit, // Batasi jumlah hasil berdasarkan limit
    });

    res.json(inventoryData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
