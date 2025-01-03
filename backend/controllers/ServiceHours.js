import LogMaster from "../models/LogMasterModel.js";
import ServiceHours from "../models/ServiceHoursModel.js";
import User from "../models/UserModel.js";

export const getServiceHours = async (req, res) => {
  try {
    const response = await ServiceHours.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "ServiceHours", action: "create" },
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
          where: { masterType: "ServiceHours" },
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
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getServiceHoursByPlantId = async (req, res) => {
  try {
    const plantId = await UserPlant.findOne({
      where: { userId: req.user.userId, flag: 1 },
    });

    const serviceHours = await ServiceHours.findOne({
      where: { plantId: plantId, flag: 1 },
    });

    if (!serviceHours) {
      return res.status(404).json({ message: "ServiceHours not found" });
    }

    const response = await ServiceHours.findAll({
      where: {
        plantId: plantId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createServiceHours = async (req, res) => {
  try {
    const { shiftId, time, warehouseId } = req.body;
    if (!shiftId || !time || !warehouseId) {
      return res
        .status(400)
        .json({ message: "shiftId, time, warehouseId are required" });
    }

    const serviceHours = await ServiceHours.findOne({
      where: {
        shiftId: shiftId,
        warehouseId: warehouseId,
        time: time,
        flag: 1,
      },
    });

    if (serviceHours) {
      return res.status(404).json({ message: "ServiceHours already exists" });
    }

    await ServiceHours.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "ServiceHours Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateServiceHours = async (req, res) => {
  try {
    const { shiftId, plantId } = req.params;

    const serviceHours = await ServiceHours.findOne({
      where: { plantId: plantId, shiftId: shiftId, flag: 1 },
    });

    if (!serviceHours) {
      return res.status(404).json({ message: "ServiceHours not found" });
    }

    await ServiceHours.update(req.body, {
      where: { plantId: plantId, shiftId: shiftId, flag: 1 },
      individualHooks: true,
      userId: req.user.userId,
    });

    res.status(200).json({ message: "ServiceHours updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteServiceHours = async (req, res) => {
  try {
    const { shiftId, plantId } = req.params; // Mengambil shiftId dan plantId dari parameter URL

    // Cek apakah relasi antara Division dan Plant dengan flag 1 (aktif) ada
    const serviceHours = await ServiceHours.findOne({
      where: { shiftId: shiftId, plantId: plantId, flag: 1 }, // Hanya mencari relasi aktif (flag = 1)
    });

    if (!serviceHours) {
      return res.status(404).json({
        message: "ServiceHours relation not found or already deleted",
      });
    }

    // Update flag menjadi 0 (soft delete)
    await ServiceHours.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      {
        where: { shiftId: shiftId, plantId: plantId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "ServiceHours relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
