import Division from "../models/DivisionModel.js";

export const getDivision = async (req, res) => {
  try {
    const response = await Division.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDivisionById = async (req, res) => {
  try {
    const divisionId = req.params.id;

    const division = await Division.findOne({
      where: { id: divisionId, flag: 1 },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    const response = await Division.findOne({
      where: {
        id: divisionId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDivision = async (req, res) => {
  try {
    const divisionName = await Division.findOne({
      where: { divisionName: req.body.divisionName, flag: 1 },
    });
    if (divisionName) {
      return res.status(400).json({ message: "Division already exists" });
    }

    await Division.create(req.body);
    res.status(201).json({ message: "Division Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDivision = async (req, res) => {
  try {
    const divisionId = req.params.id;

    const division = await Division.findOne({
      where: { id: divisionId, flag: 1 },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    await Division.update(req.body, {
      where: {
        id: divisionId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Division Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDivision = async (req, res) => {
  try {
    const divisionId = req.params.id;

    const division = await Division.findOne({
      where: { id: divisionId, flag: 1 },
    });

    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    await Division.update({ flag: 0 }, { where: { id: divisionId, flag: 1 } });

    res.status(200).json({ message: "Division deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
