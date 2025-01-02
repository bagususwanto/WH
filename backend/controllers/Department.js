import Department from "../models/DepartmentModel.js";
import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";

export const getDepartment = async (req, res) => {
  try {
    const response = await Department.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Department", action: "create" },
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
          where: { masterType: "Department" },
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

export const getDepartmentById = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department.findOne({
      where: { id: departmentId, flag: 1 },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const response = await Department.findOne({
      where: {
        id: departmentId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const departmentName = await Department.findOne({
      where: { departmentName: req.body.departmentName, flag: 1 },
    });
    if (departmentName) {
      return res.status(400).json({ message: "Department already exists" });
    }

    await Department.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "Department Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department.findOne({
      where: { id: departmentId, flag: 1 },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await Department.update(req.body, {
      where: {
        id: departmentId,
        flag: 1,
      },
      individualHooks: true,
      userId: req.user.userId,
    });
    res.status(200).json({ message: "Department Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    const department = await Department.findOne({
      where: { id: departmentId, flag: 1 },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await Department.update(
      { flag: 0 },
      {
        where: { id: departmentId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
