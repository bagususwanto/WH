import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import LogImport from "../models/LogImportModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Plant from "../models/PlantModel.js";
import Supplier from "../models/SupplierModel.js";
import User from "../models/UserModel.js";

export const getDeliverySchedule = async (req, res) => {
  try {
    const {
      // page = 1,
      // limit = 10,
      plantId,
      day,
    } = req.query;

    let whereCondition = { flag: 1 };
    let whereConditionPlant = { flag: 1 };

    // Hitung nilai offset berdasarkan halaman
    // const offset = (page - 1) * limit;

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
      // limit: parseInt(limit), // Tentukan jumlah data yang diambil (limit)
      // offset: parseInt(offset), // Tentukan dari data ke berapa (offset)
    });

    // Hitung total data untuk pagination
    // const totalData = await DeliverySchedule.count({
    //   where: whereCondition,
    //   include: [
    //     {
    //       model: Supplier,
    //       required: true,
    //       where: { flag: 1 },
    //     },
    //     {
    //       model: Plant,
    //       required: true,
    //       where: whereConditionPlant,
    //     },
    //   ],
    // });

    // // Menghitung total halaman
    // const totalPages = Math.ceil(totalData / limit);

    if (data.length === 0) {
      return res.status(404).json({
        data,
        message: "Data Delivery Schedule Not Found",
      });
    }

    // Kirim data dan informasi pagination
    res.status(200).json({
      data,
      message: "Data Delivery Schedule Found",
      // pagination: {
      //   currentPage: page,
      //   totalPages,
      //   totalData,
      //   limit: parseInt(limit),
      // },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDeliveryScheduleById = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await DeliverySchedule.findOne({
      where: { id, flag: 1 },
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

    // Kirim data dan informasi pagination
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createDeliverySchedule = async (req, res) => {
  const transaction = await db.transaction();
  try {
    // Body
    const {
      supplierId,
      schedule,
      arrival,
      departure,
      truckStation,
      rit,
      plantId,
    } = req.body;

    // Validasi data tersedia
    if (
      !supplierId ||
      !schedule ||
      !arrival ||
      !departure ||
      !truckStation ||
      !rit ||
      !plantId
    ) {
      return res.status(400).json({
        message: "All fields are required, except packaging and unit packaging",
      });
    }

    const supplier = await Supplier.findOne({
      where: { id: supplierId, flag: 1 },
    });
    if (!supplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });
    if (!plant) {
      return res.status(400).json({ message: "Plant not found" });
    }

    const existingDeliverySchedule = await DeliverySchedule.findOne({
      where: {
        supplierId,
        schedule,
        rit,
        plantId,
        flag: 1,
      },
    });

    if (existingDeliverySchedule) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Delivery Schedule already exist" });
    }

    // Buat ds baru
    const newDs = await DeliverySchedule.create(
      {
        supplierId,
        schedule,
        arrival,
        departure,
        truckStation,
        rit,
        plantId,
      },
      { userId: req.user.userId, transaction }
    );

    await transaction.commit();
    res.status(201).json({
      message: "Delivery Schedule Created",
      "Delivery Schedule": newDs,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDeliverySchedule = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const id = req.params.id;

    // Body
    const {
      supplierId,
      schedule,
      arrival,
      departure,
      truckStation,
      rit,
      plantId,
    } = req.body;

    // validasi data tersedia
    if (
      !supplierId ||
      !schedule ||
      !arrival ||
      !departure ||
      !truckStation ||
      !rit ||
      !plantId
    ) {
      return res.status(400).json({
        message: "All fields are required, except packaging and unit packaging",
      });
    }

    const ds = await DeliverySchedule.findOne({
      where: { id, flag: 1 },
    });
    if (!ds) {
      return res.status(400).json({ message: "Delivery Schedule not found" });
    }

    const supplier = await Supplier.findOne({
      where: { id: supplierId, flag: 1 },
    });
    if (!supplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });
    if (!plant) {
      return res.status(400).json({ message: "Plant not found" });
    }

    const existingDeliverySchedule = await DeliverySchedule.findOne({
      where: {
        supplierId,
        schedule,
        rit,
        plantId,
        flag: 1,
      },
    });

    if (existingDeliverySchedule) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Delivery Schedule already exist" });
    }

    await DeliverySchedule.update(
      {
        supplierId,
        schedule,
        arrival,
        departure,
        truckStation,
        rit,
        plantId,
      },
      {
        where: {
          id,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
        transaction,
      }
    );

    await transaction.commit();
    res.status(200).json({ message: "Delivery Schedule Updated" });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDeliverySchedule = async (req, res) => {
  try {
    const id = req.params.id;

    const ds = await DeliverySchedule.findOne({
      where: { id, flag: 1 },
    });

    if (!ds) {
      return res.status(404).json({ message: "Delivery Schedule not found" });
    }

    await DeliverySchedule.update(
      { flag: 0 },
      {
        where: { id, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Delivery Schedule deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
