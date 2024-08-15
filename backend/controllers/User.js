import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../models/RoleModel.js";
import CostCenter from "../models/CostCenterModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getUser = async (req, res) => {
  try {
    const response = await User.findAll({
      where: { flag: 1 },
      attributes: ["id", "name", "createdAt", "updatedAt"],
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
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const response = await User.findOne({
      where: {
        id: userId,
        flag: 1,
      },
      attributes: ["id", "name", "createdAt", "updatedAt"],
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
  try {
    await User.create(req.body);
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
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.update(req.body, {
      where: {
        id: userId,
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
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.update({ flag: 0 }, { where: { id: userId } });

    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
