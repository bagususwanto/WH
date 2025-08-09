import Department from "../models/DepartmentModel.js";
import Division from "../models/DivisionModel.js";
import Group from "../models/GroupModel.js";
import Line from "../models/LineModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Organization from "../models/OrganizationModel.js";
import Plant from "../models/PlantModel.js";
import Section from "../models/SectionModel.js";
import User from "../models/UserModel.js";

export const getOrganization = async (req, res) => {
  try {
    const response = await Organization.findAll({
      where: { flag: 1 },
      include: [
        {
          model: Group,
          where: { flag: 1 },
          required: false,
        },
        {
          model: Line,
          where: { flag: 1 },
          required: false,
        },
        {
          model: Section,
          where: { flag: 1 },
          required: false,
        },
        {
          model: Department,
          where: { flag: 1 },
          required: false,
        },
        {
          model: Division,
          where: { flag: 1 },
          required: false,
        },
        {
          model: Plant,
          where: { flag: 1 },
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Organization", action: "create" },
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
          where: { masterType: "Organization" },
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

export const getOrganizationById = async (req, res) => {
  try {
    const shiftId = req.params.id;

    const shift = await Organization.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const response = await Organization.findOne({
      where: {
        id: shiftId,
        flag: 1,
      },
      include: [
        {
          model: Group,
          where: { flag: 1 },
        },
        {
          model: Line,
          where: { flag: 1 },
        },
        {
          model: Section,
          where: { flag: 1 },
        },
        {
          model: Department,
          where: { flag: 1 },
        },
        {
          model: Division,
          where: { flag: 1 },
        },
        {
          model: Plant,
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

export const createOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne({
      where: {
        groupId: req.body.groupId,
        lineId: req.body.lineId,
        sectionId: req.body.sectionId,
        departmentId: req.body.departmentId,
        divisionId: req.body.divisionId,
        plantId: req.body.plantId,
        flag: 1,
      },
    });

    if (organization) {
      return res.status(400).json({ message: "Organization already exists" });
    }

    await Organization.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "Organization Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const shiftId = req.params.id;

    const shift = await Organization.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await Organization.update(req.body, {
      where: {
        id: shiftId,
        flag: 1,
      },
      individualHooks: true,
      userId: req.user.userId,
    });
    res.status(200).json({ message: "Organization Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const shiftId = req.params.id;

    const shift = await Organization.findOne({
      where: { id: shiftId, flag: 1 },
    });

    if (!shift) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await Organization.update(
      { flag: 0 },
      {
        where: { id: shiftId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Organization deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
