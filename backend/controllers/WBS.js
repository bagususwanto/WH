import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";
import WBS from "../models/WBSModel.js";

export const getWBS = async (req, res) => {
  try {
    const response = await WBS.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "WBS", action: "create" },
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
          where: { masterType: "WBS" },
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
      where: {
        wbsNumber: req.body.wbsNumber,
        flag: 1,
      },
    });
    if (wbsNumber) {
      return res.status(400).json({ message: "WBS already exists" });
    }

    await WBS.create(req.body, { userId: req.user.userId });
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

    await WBS.update(
      {
        wbsYear: req.body.wbsYear,
      },
      {
        where: {
          id: wbsId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );
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

    await WBS.update(
      { flag: 0 },
      {
        where: { id: wbsId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "WBS deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
