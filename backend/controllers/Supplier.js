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
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      return res.status(404).json({ msg: "Supplier not found" });
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
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    await Supplier.create(req.body);
    res.status(201).json({ msg: "Supplier Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      return res.status(404).json({ msg: "Supplier not found" });
    }

    await Supplier.update(req.body, {
      where: {
        id: supplierId,
      },
    });
    res.status(200).json({ msg: "Supplier Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      return res.status(404).json({ msg: "Supplier not found" });
    }

    await Supplier.update({ flag: 0 }, { where: { id: supplierId } });

    res.status(200).json({ msg: "Supplier deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
