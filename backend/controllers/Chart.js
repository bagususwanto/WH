import Sequelize from "sequelize";
import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";

const { Op } = Sequelize;

export const getInventoryByHighCriticalStock = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default top 10

    // Query untuk mendapatkan inventory dengan kondisi kritis
    const inventoryData = await Inventory.findAll({
      include: [
        {
          model: Material,
          attributes: ["materialNo", "description", "minStock"],
          where: {
            minStock: {
              [Op.ne]: null, // Pastikan minStock tidak NULL
            },
          },
        },
      ],
      where: {
        quantityActualCheck: {
          [Op.ne]: null, // Pastikan quantityActualCheck tidak NULL
          [Op.lt]: Sequelize.col("Material.minStock"), // quantityActualCheck kurang dari minStock
        },
      },
      attributes: [
        [Sequelize.col("Material.description"), "name"], // Nama material dari tabel Material
        [Sequelize.literal("CAST(quantityActualCheck AS FLOAT) / CAST(Material.minStock AS FLOAT) * 2"), "stock"],
      ],
      order: [[Sequelize.literal("stock"), "ASC"]], // Urutkan dari stok terkecil
      group: [
        "Inventory.id", // Tambahkan ID Inventory ke GROUP BY
        "Inventory.quantityActualCheck", // Tambahkan quantityActualCheck ke GROUP BY
        "Material.id", // Group by material ID
        "Material.description", // Group by material description
        "Material.minStock", // Group by minStock
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
