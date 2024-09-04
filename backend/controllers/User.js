import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import Role from "../models/RoleModel.js";
import CostCenter from "../models/CostCenterModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getUser = async (req, res) => {
  try {
    const response = await User.findAll({
      where: { flag: 1 },
      attributes: ["id", "name", "username", "createdAt", "updatedAt"],
      include: [
        {
          model: Role,
          attributes: ["id", "roleName", "createdAt", "updatedAt"],
        },
        {
          model: CostCenter,
          attributes: ["id", "costCenterCode", "costCenterName", "wbsNumber", "ext", "createdAt", "updatedAt"],
          include: [
            {
              model: Shop,
              attributes: ["id", "shopName", "createdAt", "updatedAt"],
              include: [
                {
                  model: Plant,
                  attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const response = await User.findOne({
      where: {
        id: userId,
        flag: 1,
      },
      attributes: ["id", "name", "username", "createdAt", "updatedAt"],
      include: [
        {
          model: Role,
          attributes: ["id", "roleName", "createdAt", "updatedAt"],
        },
        {
          model: CostCenter,
          attributes: ["id", "costCenterCode", "costCenterName", "wbsNumber", "ext", "createdAt", "updatedAt"],
          include: [
            {
              model: Shop,
              attributes: ["id", "shopName", "createdAt", "updatedAt"],
              include: [
                {
                  model: Plant,
                  attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
                },
              ],
            },
          ],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  const { username, password, name, roleId, costCenterId } = req.body;
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  if (!username || !password || !name || !roleId || !costCenterId) {
    return res.status(400).json({ msg: "Please fill in all fields" });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({
      where: {
        username,
        flag: 1,
      },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Username already exists" });
    }

    await User.create({
      username: username,
      password: hashPassword,
      name: name,
      roleId: roleId,
      costCenterId: costCenterId,
    });
    res.status(201).json({ msg: "User Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.update(req.body, {
      where: {
        id: userId,
        flag: 1,
      },
    });
    res.status(200).json({ msg: "User Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.update({ flag: 0 }, { where: { id: userId, flag: 1 } });

    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
