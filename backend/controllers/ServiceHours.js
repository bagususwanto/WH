import ServiceHours from "../models/ServiceHoursModel.js";
import Plant from "../models/PlantModel.js";
import Shift from "../models/ShiftModel.js";

export const getServiceHours = async (req, res) => {
  try {
    const response = await ServiceHours.findAll({
      where: { flag: 1 },
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
    const { shiftId, plantId, startTime, endTime } = req.body;
    if ((!shiftId || !plantId, !startTime, !endTime)) {
      return res.status(400).json({ message: "shiftId, plantId, startTime, endTime are required" });
    }

    const shift = await Shift.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const existingServiceHours = await ServiceHours.findOne({
      where: { shiftId: shiftId, plantId: plantId, flag: 1 },
    });

    if (existingServiceHours) {
      return res.status(400).json({ message: "ServiceHours already exists" });
    }

    await ServiceHours.create(req.body);
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

    await ServiceHours.update(req.body, { where: { plantId: plantId, shiftId: shiftId, flag: 1 } });

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
      return res.status(404).json({ message: "ServiceHours relation not found or already deleted" });
    }

    // Update flag menjadi 0 (soft delete)
    await ServiceHours.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      { where: { shiftId: shiftId, plantId: plantId, flag: 1 } }
    );

    res.status(200).json({ message: "ServiceHours relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
