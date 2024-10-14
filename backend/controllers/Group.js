import Group from "../models/GroupModel.js";
import Line from "../models/LineModel.js";
import Section from "../models/SectionModel.js";
import Department from "../models/DepartmentModel.js";
import Division from "../models/DivisionModel.js";
import Plant from "../models/PlantModel.js";

export const getGroup = async (req, res) => {
  try {
    const response = await Group.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findOne({
      where: { id: groupId, flag: 1 },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const response = await Group.findOne({
      where: {
        id: groupId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createGroup = async (req, res) => {
  try {
    const groupName = await Group.findOne({
      where: { groupName: req.body.groupName, flag: 1 },
    });
    if (groupName) {
      return res.status(400).json({ message: "Group already exists" });
    }

    await Group.create(req.body);
    res.status(201).json({ message: "Group Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findOne({
      where: { id: groupId, flag: 1 },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await Group.update(req.body, {
      where: {
        id: groupId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Group Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findOne({
      where: { id: groupId, flag: 1 },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await Group.update({ flag: 0 }, { where: { id: groupId, flag: 1 } });

    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
