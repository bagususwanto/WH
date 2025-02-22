import GIC from "../models/GICModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Organization from "../models/OrganizationModel.js";
import Plant from "../models/PlantModel.js";
import Section from "../models/SectionModel.js";
import User from "../models/UserModel.js";
import WBS from "../models/WBSModel.js";

export const getSection = async (req, res) => {
  try {
    const response = await Section.findAll({
      where: { flag: 1 },
      include: [
        {
          model: GIC,
          required: true,
          attributes: ["id", "gicNumber"],
          where: { flag: 1 },
        },
        {
          model: WBS,
          required: true,
          attributes: ["id", "wbsNumber"],
          where: { flag: 1 },
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Section", action: "create" },
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
          where: { masterType: "Section" },
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

export const getSectionById = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findOne({
      where: { id: sectionId, flag: 1 },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const response = await Section.findOne({
      where: {
        id: sectionId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSection = async (req, res) => {
  try {
    const sectionCode = await Section.findOne({
      where: { sectionCode: req.body.sectionCode, flag: 1 },
    });
    if (sectionCode) {
      return res.status(400).json({ message: "Section already exists" });
    }

    await Section.create(
      {
        sectionCode: req.body.sectionCode,
        sectionName: req.body.sectionName,
        gicId: req.body.gicId,
        wbsId: req.body.wbsId,
      },
      { userId: require.user.userId }
    );
    res.status(201).json({ message: "Section Created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSection = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findOne({
      where: { id: sectionId, flag: 1 },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await Section.update(
      {
        sectionName: req.body.sectionName,
        gicId: req.body.gicId,
        wbsId: req.body.wbsId,
      },
      {
        where: {
          id: sectionId,
          flag: 1,
        },
        individualHooks: true,
        userId: require.user.userId,
      }
    );
    res.status(200).json({ message: "Section Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.id;

    const section = await Section.findOne({
      where: { id: sectionId, flag: 1 },
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await Section.update(
      { flag: 0 },
      {
        where: { id: sectionId, flag: 1 },
        individualHooks: true,
        userId: require.user.userId,
      }
    );

    res.status(200).json({ message: "Section deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSectionByPlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    // Query untuk mendapatkan satu Plant
    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
      attributes: ["id"],
    });

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Query Section berdasarkan Plant
    const response = await Section.findAll({
      attributes: ["id", "sectionName"],
      include: [
        {
          model: Organization,
          required: true,
          attributes: ["id"],
          where: { flag: 1 },
          include: [
            {
              model: Plant,
              required: true,
              attributes: ["id"],
              where: { id: plant.id, flag: 1 },
            },
          ],
        },
      ],
    });

    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
