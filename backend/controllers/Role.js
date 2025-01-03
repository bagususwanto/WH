import LogMaster from "../models/LogMasterModel.js";
import Role from "../models/RoleModel.js";
import User from "../models/UserModel.js";

export const getRole = async (req, res) => {
  try {
    const response = await Role.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Role", action: "create" },
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
          where: { masterType: "Role" },
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

    await Role.create(req.body, { userId: req.user.userId });
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
      individualHooks: true,
      userId: req.user.userId,
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

    await Role.update(
      { flag: 0 },
      {
        where: { id: roleId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Role deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
