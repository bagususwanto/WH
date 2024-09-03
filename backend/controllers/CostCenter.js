import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../models/RoleModel.js";
import CostCenter from "../models/CostCenterModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getCostCenter = async (req, res) => {
  try {
    const response = await CostCenter.findAll({
      where: { flag: 1 },
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
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getCostCenterById = async (req, res) => {
  try {
    const costCenterId = req.params.id;

    const costCenter = await CostCenter.findOne({
      where: { id: costCenterId, flag: 1 },
    });

    if (!costCenter) {
      return res.status(404).json({ msg: "CostCenter not found" });
    }

    const response = await CostCenter.findOne({
      where: {
        id: costCenterId,
        flag: 1,
      },
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
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createCostCenter = async (req, res) => {
  try {
    const constCenterCode = await CostCenter.findOne({
      where: { costCenterCode: req.body.costCenterCode, flag: 1 },
    });

    if (constCenterCode) {
      return res.status(400).json({ msg: "CostCenter already exists" });
    }

    await CostCenter.create(req.body);
    res.status(201).json({ msg: "CostCenter Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateCostCenter = async (req, res) => {
  try {
    const costCenterId = req.params.id;

    const costCenter = await CostCenter.findOne({
      where: { id: costCenterId, flag: 1 },
    });

    if (!costCenter) {
      return res.status(404).json({ msg: "CostCenter not found" });
    }

    await CostCenter.update(req.body, {
      where: {
        id: costCenterId,
        flag: 1,
      },
    });
    res.status(200).json({ msg: "CostCenter Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteCostCenter = async (req, res) => {
  try {
    const costCenterId = req.params.id;

    const costCenter = await CostCenter.findOne({
      where: { id: costCenterId, flag: 1 },
    });

    if (!costCenter) {
      return res.status(404).json({ msg: "CostCenter not found" });
    }

    await CostCenter.update({ flag: 0 }, { where: { id: costCenterId, flag: 1 } });

    res.status(200).json({ msg: "CostCenter deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
