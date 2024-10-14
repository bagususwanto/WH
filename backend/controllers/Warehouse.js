import Warehouse from "../models/WarehouseModel.js";

export const getWarehouse = async (req, res) => {
  try {
    const response = await Warehouse.findAll({
      where: { flag: 1 },
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
    const warehouseName = await Warehouse.findOne({
      where: { warehouseName: req.body.warehouseName, flag: 1 },
    });

    if (warehouseName) {
      return res.status(400).json({ message: "Warehouse already exists" });
    }

    await Warehouse.create(req.body);
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

    await Warehouse.update(req.body, {
      where: {
        id: warehouseId,
        flag: 1,
      },
    });
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

    await Warehouse.update({ flag: 0 }, { where: { id: warehouseId, flag: 1 } });

    res.status(200).json({ message: "Warehouse deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
