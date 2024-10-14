import WBS from "../models/WBSModel.js";

export const getWBS = async (req, res) => {
  try {
    const response = await WBS.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWBSById = async (req, res) => {
  try {
    const wbsId = req.params.id;

    const wbs = await WBS.findOne({
      where: { id: wbsId, flag: 1 },
    });

    if (!wbs) {
      return res.status(404).json({ message: "WBS not found" });
    }

    const response = await WBS.findOne({
      where: {
        id: wbsId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createWBS = async (req, res) => {
  try {
    const wbsNumber = await WBS.findOne({
      where: { wbsNumber: req.body.wbsNumber, wbsYear: req.body.wbsYear, flag: 1 },
    });
    if (wbsNumber) {
      return res.status(400).json({ message: "WBS already exists" });
    }

    await WBS.create(req.body);
    res.status(201).json({ message: "WBS Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateWBS = async (req, res) => {
  try {
    const wbsId = req.params.id;

    const wbs = await WBS.findOne({
      where: { id: wbsId, flag: 1 },
    });

    if (!wbs) {
      return res.status(404).json({ message: "WBS not found" });
    }

    await WBS.update(req.body, {
      where: {
        id: wbsId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "WBS Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteWBS = async (req, res) => {
  try {
    const wbsId = req.params.id;

    const wbs = await WBS.findOne({
      where: { id: wbsId, flag: 1 },
    });

    if (!wbs) {
      return res.status(404).json({ message: "WBS not found" });
    }

    await WBS.update({ flag: 0 }, { where: { id: wbsId, flag: 1 } });

    res.status(200).json({ message: "WBS deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
