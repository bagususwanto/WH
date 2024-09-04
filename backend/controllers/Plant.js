import Plant from "../models/PlantModel.js";

export const getPlant = async (req, res) => {
  try {
    const response = await Plant.findAll({
      where: { flag: 1 },
      attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlantById = async (req, res) => {
  try {
    const plantId = req.params.id;

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const response = await Plant.findOne({
      where: {
        id: plantId,
        flag: 1,
      },
      attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPlant = async (req, res) => {
  try {
    const plantCode = await Plant.findOne({
      where: { plantCode: req.body.plantCode, flag: 1 },
    });

    if (plantCode) {
      return res.status(400).json({ message: "Plant Code already exist" });
    }

    await Plant.create(req.body);
    res.status(201).json({ message: "Plant Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    await Plant.update(req.body, {
      where: {
        id: plantId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Plant Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    await Plant.update({ flag: 0 }, { where: { id: plantId, flag: 1 } });

    res.status(200).json({ message: "Plant deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
