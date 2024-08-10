import Role from "../models/RoleModel.js";

export const getRole = async (req, res) => {
  try {
    const response = await Role.findAll({
      where: { flag: 1 },
      attributes: ["id", "roleName", "createdAt", "updatedAt"],
    });
    
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findOne({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    const response = await Role.findOne({
      where: {
        id: roleId,
        flag: 1,
      },
      attributes: ["id", "roleName", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createRole = async (req, res) => {
  try {
    await Role.create(req.body);
    res.status(201).json({ msg: "Role Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findOne({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    await Role.update(req.body, {
      where: {
        id: roleId,
      },
    });
    res.status(200).json({ msg: "Role Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findOne({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    await Role.update({ flag: 0 }, { where: { id: roleId } });

    res.status(200).json({ msg: "Role deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
