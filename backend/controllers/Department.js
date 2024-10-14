import Department from "../models/DepartmentModel.js";

export const getDepartment = async (req, res) => {
  try {
    const response = await Department.findAll({
      where: { flag: 1 },
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

    await Department.create(req.body);
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

    await Department.update({ flag: 0 }, { where: { id: departmentId, flag: 1 } });

    res.status(200).json({ message: "Department deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
