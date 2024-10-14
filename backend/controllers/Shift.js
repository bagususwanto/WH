import Shift from "../models/ShiftModel.js";

export const getShift = async (req, res) => {
  try {
    const response = await Shift.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getShiftById = async (req, res) => {
  try {
    const shiftId = req.params.id;

    const shift = await Shift.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    const response = await Shift.findOne({
      where: {
        id: shiftId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createShift = async (req, res) => {
  try {
    const shiftName = await Shift.findOne({
      where: { shiftName: req.body.shiftName, flag: 1 },
    });
    if (shiftName) {
      return res.status(400).json({ message: "Shift already exists" });
    }

    await Shift.create(req.body);
    res.status(201).json({ message: "Shift Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateShift = async (req, res) => {
  try {
    const shiftId = req.params.id;

    const shift = await Shift.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await Shift.update(req.body, {
      where: {
        id: shiftId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Shift Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const shiftId = req.params.id;

    const shift = await Shift.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await Shift.update({ flag: 0 }, { where: { id: shiftId, flag: 1 } });

    res.status(200).json({ message: "Shift deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
