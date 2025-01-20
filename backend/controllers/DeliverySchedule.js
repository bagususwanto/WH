import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import LogImport from "../models/LogImportModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";
import User from "../models/UserModel.js";

export const getDeliverySchedule = async (req, res) => {
  try {
    const { page = 1, limit = 10, plantId, day } = req.query;

    let whereCondition = { flag: 1 };
    let whereConditionPlant = { flag: 1 };

    // Hitung nilai offset berdasarkan halaman
    const offset = (page - 1) * limit;

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    if (day) {
      whereCondition.schedule = day;
    }

    // Cari data produk dengan paginasi (limit dan offset)
    const data = await DeliverySchedule.findAll({
      where: whereCondition,
      include: [
        {
          model: Supplier,
          required: true,
          attributes: ["id", "SupplierName", "supplierCode"],
          where: { flag: 1 },
        },
        {
          model: Plant,
          required: true,
          attributes: ["id", "PlantName", "plantCode"],
          where: whereConditionPlant,
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "DeliverySchedule", action: "create" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
        {
          model: LogMaster,
          required: false,
          as: "updatedBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "DeliverySchedule" },
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
        {
          model: LogImport,
          attributes: ["id", "createdAt", "userId"],
          required: false,
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      limit: parseInt(limit), // Tentukan jumlah data yang diambil (limit)
      offset: parseInt(offset), // Tentukan dari data ke berapa (offset)
    });

    // Hitung total data untuk pagination
    const totalData = await DeliverySchedule.count({
      where: whereCondition,
      include: [
        {
          model: Supplier,
          required: true,
          where: { flag: 1 },
        },
        {
          model: Plant,
          required: true,
          where: whereConditionPlant,
        },
      ],
    });

    // Menghitung total halaman
    const totalPages = Math.ceil(totalData / limit);

    // Kirim data dan informasi pagination
    res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalData,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
