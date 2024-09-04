import Supplier from "../models/SupplierModel.js";

export const getSupplier = async (req, res) => {
  try {
    const response = await Supplier.findAll({
      where: { flag: 1 },
      attributes: ["id", "supplierName", "createdAt", "updatedAt"],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({
      where: { id: supplierId, flag: 1 },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const response = await Supplier.findOne({
      where: {
        id: supplierId,
        flag: 1,
      },
      attributes: ["id", "supplierName", "createdAt", "updatedAt"],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplierName = await Supplier.findOne({
      where: { supplierName: req.body.supplierName, flag: 1 },
    });

    if (supplierName) {
      return res.status(400).json({ message: "Supplier already exists" });
    }

    await Supplier.create(req.body);
    res.status(201).json({ message: "Supplier Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({
      where: { id: supplierId, flag: 1 },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await Supplier.update(req.body, {
      where: {
        id: supplierId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Supplier Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({
      where: { id: supplierId, flag: 1 },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await Supplier.update({ flag: 0 }, { where: { id: supplierId, flag: 1 } });

    res.status(200).json({ message: "Supplier deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
