import Line from "../models/LineModel.js";
import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";

export const getLine = async (req, res) => {
  try {
    const response = await Line.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Line", action: "create" },
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
          where: { masterType: "Line" },
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

export const getLineById = async (req, res) => {
  try {
    const lineId = req.params.id;

    const line = await Line.findOne({
      where: { id: lineId, flag: 1 },
    });

    if (!line) {
      return res.status(404).json({ message: "Line not found" });
    }

    const response = await Line.findOne({
      where: {
        id: lineId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createLine = async (req, res) => {
  try {
    const lineName = await Line.findOne({
      where: { lineName: req.body.lineName, flag: 1 },
    });
    if (lineName) {
      return res.status(400).json({ message: "Line already exists" });
    }

    await Line.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "Line Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLine = async (req, res) => {
  try {
    const lineId = req.params.id;

    const line = await Line.findOne({
      where: { id: lineId, flag: 1 },
    });

    if (!line) {
      return res.status(404).json({ message: "Line not found" });
    }

    await Line.update(req.body, {
      where: {
        id: lineId,
        flag: 1,
      },
      individualHooks: true,
      userId: req.user.userId,
    });
    res.status(200).json({ message: "Line Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteLine = async (req, res) => {
  try {
    const lineId = req.params.id;

    const line = await Line.findOne({
      where: { id: lineId, flag: 1 },
    });

    if (!line) {
      return res.status(404).json({ message: "Line not found" });
    }

    await Line.update(
      { flag: 0 },
      {
        where: { id: lineId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Line deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
