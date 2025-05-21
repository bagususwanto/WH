import LogImport from "../models/LogImportModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Supplier from "../models/SupplierModel.js";
import User from "../models/UserModel.js";

export const getSupplier = async (req, res) => {
  try {
    const response = await Supplier.findAll({
      where: { flag: 1 },
      include: [
        {
          model: LogMaster,
          required: false,
          as: "createdBy",
          attributes: ["id", "createdAt", "userId"],
          where: { masterType: "Supplier", action: "create" },
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
          where: { masterType: "Supplier" },
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
        {
          model: LogImport,
          attributes: ["id", "createdAt", "userId"],
          required: false,
          include: [
            {
              model: User,
              required: false,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
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
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSupplier = async (req, res) => {
  try {
    // Cek apakah supplierCode sudah ada
    const supplierCode = await Supplier.findOne({
      where: { supplierCode: req.body.supplierCode, flag: 1 },
    });

    if (supplierCode) {
      return res.status(400).json({ message: "Supplier already exists" });
    }

    // Tambahkan userId ke options untuk Sequelize hooks
    await Supplier.create(req.body, { userId: req.user.userId });

    res.status(201).json({ message: "Supplier Created" });
  } catch (error) {
    console.log(error);
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

    await Supplier.update(
      {
        supplierName: req.body.supplierName,
      },
      {
        where: {
          id: supplierId,
          flag: 1,
        },
        individualHooks: true,
        userId: req.user.userId,
      }
    );
    res.status(200).json({ message: "Supplier Updated" });
  } catch (error) {
    console.log(error);
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

    await Supplier.update(
      { flag: 0 },
      {
        where: { id: supplierId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "Supplier deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVendorNameByVendorCode = async (req, res) => {
  try {
    const { vendorCode } = req.query;

    const data = await Supplier.findOne({
      where: {
        supplierCode: vendorCode,
        flag: 1,
      },
      attributes: ["id", "supplierName"],
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "Vendor Not Found" });
    }

    // Return sorted data
    return res.status(200).json({
      data,
      message: "Vendor Found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
