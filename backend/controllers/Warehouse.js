import LogMaster from "../models/LogMasterModel.js";
import Plant from "../models/PlantModel.js";
import User from "../models/UserModel.js";
import UserWarehouse from "../models/UserWarehouseModel.js";
import Warehouse from "../models/WarehouseModel.js";

export const getWarehouse = async (req, res) => {
  try {
    const response = await Warehouse.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Warehouse", action: "create" },
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
          where: { masterType: "Warehouse" },
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

export const getWarehouseById = async (req, res) => {
  try {
    const warehouseId = req.params.id;

    const warehouse = await Warehouse.findOne({
      where: { id: warehouseId, flag: 1 },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const response = await Warehouse.findOne({
      where: {
        id: warehouseId,
        flag: 1,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const warehouseCode = await Warehouse.findOne({
      where: { warehouseCode: req.body.warehouseCode, flag: 1 },
    });

    if (warehouseCode) {
      return res.status(400).json({ message: "Warehouse already exists" });
    }

    await Warehouse.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "Warehouse Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const warehouseId = req.params.id;

    const warehouse = await Warehouse.findOne({
      where: { id: warehouseId, flag: 1 },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await Warehouse.update(
      {
        warehouseName: req.body.warehouseName,
      },
      {
        where: {
          id: warehouseId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );
    res.status(200).json({ message: "Warehouse Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const warehouseId = req.params.id;

    const warehouse = await Warehouse.findOne({
      where: { id: warehouseId, flag: 1 },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await Warehouse.update(
      { flag: 0 },
      {
        where: { id: warehouseId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Warehouse deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWarehouseByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const warehouse = await UserWarehouse.findOne({
      where: { userId, flag: 1 },
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const response = await Warehouse.findOne({
      where: {
        flag: 1,
      },
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          where: {
            id: userId,
            flag: 1,
          },
          required: true,
        },
      ],
    });

    if (!response) {
      return res.status(404).json({ message: "Warehouse user not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWarehouseByPlantId = async (req, res) => {
  try {
    const plantId = req.params.plantId;

    const plant = await Plant.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!plantId) {
      return res.status(404).json({ message: "plantId not found" });
    }

    if (!plant) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const response = await Warehouse.findOne({
      attributes: ["id", "warehouseName"],
      where: {
        flag: 1,
      },
      include: [
        {
          model: Plant,
          attributes: ["id", "plantName"],
          where: {
            id: plantId,
            flag: 1,
          },
          required: true,
        },
      ],
    });

    if (!response) {
      return res.status(404).json({ message: "Warehouse plant not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
