import CostCenter from "../models/CostCenterModel.js";

export const getCostCenter = async (req, res) => {
  try {
    const response = await CostCenter.findAll({
      where: { flag: 1 },
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

    await CostCenter.create(req.body);
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

    await CostCenter.update(req.body, {
      where: {
        id: costCenterId,
        flag: 1,
      },
    });
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

    await CostCenter.update({ flag: 0 }, { where: { id: costCenterId, flag: 1 } });

    res.status(200).json({ message: "CostCenter deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
