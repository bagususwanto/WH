import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";

export const getMaterial = async (req, res) => {
  try {
    const response = await Material.findAll({
      where: { flag: 1 },
      attributes: ["id", "materialNo", "description", "uom", "price", "type", "minStock", "maxStock", "img", "createdAt", "updatedAt"],
      include: [
        {
          model: Category,
          attributes: ["id", "categoryName", "createdAt", "updatedAt"],
        },
        {
          model: Supplier,
          attributes: ["id", "supplierName", "createdAt", "updatedAt"],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const response = await Material.findOne({
      where: {
        id: materialId,
        flag: 1,
      },
      attributes: ["id", "materialNo", "description", "uom", "price", "type", "minStock", "maxStock", "img", "createdAt", "updatedAt"],
      include: [
        {
          model: Category,
          attributes: ["id", "categoryName", "createdAt", "updatedAt"],
        },
        {
          model: Supplier,
          attributes: ["id", "supplierName", "createdAt", "updatedAt"],
        },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMaterialIdByMaterialNo = async (req, res) => {
  try {
    const response = await Material.findOne({
      where: { materialNo: req.params.materialno, flag: 1 },
      attributes: ["id"],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMaterial = async (req, res) => {
  try {
    const materialNo = await Material.findOne({
      where: { materialNo: req.body.materialNo, flag: 1 },
    });

    if (materialNo) {
      return res.status(400).json({ message: "Material No. already exists" });
    }

    await Material.create(req.body);
    res.status(201).json({ message: "Material Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    await Material.update(req.body, {
      where: {
        id: materialId,
        flag: 1,
      },
    });
    res.status(200).json({ message: "Material Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    await Material.update({ flag: 0 }, { where: { id: materialId, flag: 1 } });

    res.status(200).json({ message: "Material deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
