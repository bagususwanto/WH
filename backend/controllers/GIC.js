import CostCenter from "../models/CostCenterModel.js";
import GIC from "../models/GICModel.js";

export const getGIC = async (req, res) => {
  try {
    const response = await GIC.findAll({
      where: { flag: 1 },
      include: [
        {
          model: CostCenter,
          where: { flag: 1 },
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGICById = async (req, res) => {
  try {
    const gicId = req.params.id;

    const gic = await GIC.findOne({
      where: { id: gicId, flag: 1 },
      include: [
        {
          model: CostCenter,
          where: { flag: 1 },
        },
      ],
    });

    if (!gic) {
      return res.status(404).json({ message: "GIC not found" });
    }

    const response = await GIC.findOne({
      where: {
        id: gicId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createGIC = async (req, res) => {
  try {
    const gicName = await GIC.findOne({
      where: { gicName: req.body.gicName, flag: 1 },
    });
    if (gicName) {
      return res.status(400).json({ message: "GIC already exists" });
    }

    await GIC.create(req.body);
    res.status(201).json({ message: "GIC Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGIC = async (req, res) => {
  try {
    const gicId = req.params.id;

    const gic = await GIC.findOne({
      where: { id: gicId, flag: 1 },
    });

    if (!gic) {
      return res.status(404).json({ message: "GIC not found" });
    }

    await GIC.update(req.body, {
      where: {
        id: gicId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "GIC Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGIC = async (req, res) => {
  try {
    const gicId = req.params.id;

    const gic = await GIC.findOne({
      where: { id: gicId, flag: 1 },
    });

    if (!gic) {
      return res.status(404).json({ message: "GIC not found" });
    }

    await GIC.update({ flag: 0 }, { where: { id: gicId, flag: 1 } });

    res.status(200).json({ message: "GIC deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
