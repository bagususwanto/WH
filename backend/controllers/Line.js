import Line from "../models/LineModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Organization from "../models/OrganizationModel.js";
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

export const checkLineId = async (req, res) => {
  try {
    const lineId = req.params.lineId;

    if (!lineId) {
      return res
        .status(400)
        .json({ status: false, message: "Line ID is required" });
    }

    const line = await Line.findOne({
      where: { id: lineId },
    });

    if (!line) {
      return res.status(404).json({ status: false, message: "Line not found" });
    }

    res.status(200).json({ status: true, message: "Line found" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLineByIds = async (req, res) => {
  try {
    const ids = req.query.ids?.split(",").map((id) => parseInt(id));

    const response = await Line.findAll({
      where: {
        id: ids,
      },
      attributes: ["id", "lineName"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLineSpecific = async (req, res) => {
  const { sectionId, roleName } = req.query;
  let whereCondition = { flag: 1 };

  if (
    roleName === "group head" ||
    roleName === "line head" ||
    roleName === "section head"
  ) {
    whereCondition.sectionId = sectionId;
  }

  try {
    const response = await Line.findAll({
      where: { flag: 1 },
      include: [
        {
          model: Organization,
          where: whereCondition,
        },
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
