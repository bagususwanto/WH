import Role from "../models/RoleModel.js";

export const getRole = async (req, res) => {
  try {
    const response = await Role.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findOne({
      where: { id: roleId, flag: 1 },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const response = await Role.findOne({
      where: {
        id: roleId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRole = async (req, res) => {
  try {
    const roleName = await Role.findOne({
      where: { roleName: req.body.roleName, flag: 1 },
    });

    if (roleName) {
      return res.status(400).json({ message: "Role already exists" });
    }

    await Role.create(req.body);
    res.status(201).json({ message: "Role Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findOne({
      where: { id: roleId, flag: 1 },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await Role.update(req.body, {
      where: {
        id: roleId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Role Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findOne({
      where: { id: roleId, flag: 1 },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await Role.update({ flag: 0 }, { where: { id: roleId, flag: 1 } });

    res.status(200).json({ message: "Role deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
