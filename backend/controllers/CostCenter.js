import CostCenter from "../models/CostCenterModel.js";
import LogMaster from "../models/LogMasterModel.js";
import User from "../models/UserModel.js";

export const getCostCenter = async (req, res) => {
  try {
    const response = await CostCenter.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "CostCenter", action: "create" },
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
          where: { masterType: "CostCenter" },
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

export const getCostCenterById = async (req, res) => {
  try {
    const costCenterId = req.params.id;

    const costCenter = await CostCenter.findOne({
      where: { id: costCenterId, flag: 1 },
    });

    if (!costCenter) {
      return res.status(404).json({ message: "CostCenter not found" });
    }

    const response = await CostCenter.findOne({
      where: {
        id: costCenterId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCostCenter = async (req, res) => {
  try {
    const constCenter = await CostCenter.findOne({
      where: { costCenter: req.body.costCenter, flag: 1 },
    });

    if (constCenter) {
      return res.status(400).json({ message: "CostCenter already exists" });
    }

    await CostCenter.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "CostCenter Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCostCenter = async (req, res) => {
  try {
    const costCenterId = req.params.id;

    const costCenter = await CostCenter.findOne({
      where: { id: costCenterId, flag: 1 },
    });

    if (!costCenter) {
      return res.status(404).json({ message: "CostCenter not found" });
    }

    await CostCenter.update(
      {
        costCenterName: req.body.costCenterName,
      },
      {
        where: {
          id: costCenterId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );
    res.status(200).json({ message: "CostCenter Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCostCenter = async (req, res) => {
  try {
    const costCenterId = req.params.id;

    const costCenter = await CostCenter.findOne({
      where: { id: costCenterId, flag: 1 },
    });

    if (!costCenter) {
      return res.status(404).json({ message: "CostCenter not found" });
    }

    await CostCenter.update(
      { flag: 0 },
      {
        where: { id: costCenterId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "CostCenter deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
