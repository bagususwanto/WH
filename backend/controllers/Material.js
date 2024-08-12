import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Location from "../models/LocationModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";

export const getMaterial = async (req, res) => {
  try {
    const response = await Material.findAll({
      where: { flag: 1 },
      attributes: ["id", "materialNo", "description", "uom", "price", "stdStock", "img", "createdAt", "updatedAt"],
      include: [
        {
          model: AddressRack,
          attributes: ["id", "addressRackName", "createdAt", "updatedAt"],
          include: [
            {
              model: Location,
              attributes: ["id", "locationName", "createdAt", "updatedAt"],
              include: [
                {
                  model: Shop,
                  attributes: ["id", "shopName", "costCenter", "wbsNumber", "ext", "createdAt", "updatedAt"],
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
        },
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
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId },
    });

    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }

    const response = await Material.findOne({
      where: {
        id: materialId,
        flag: 1,
      },
      attributes: ["id", "materialNo", "description", "uom", "price", "stdStock", "img", "createdAt", "updatedAt"],
      include: [
        {
          model: AddressRack,
          attributes: ["id", "addressRackName", "createdAt", "updatedAt"],
          include: [
            {
              model: Location,
              attributes: ["id", "locationName", "createdAt", "updatedAt"],
              include: [
                {
                  model: Shop,
                  attributes: ["id", "shopName", "costCenter", "wbsNumber", "ext", "createdAt", "updatedAt"],
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
        },
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
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createMaterial = async (req, res) => {
  try {
    await Material.create(req.body);
    res.status(201).json({ msg: "Material Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId },
    });

    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }

    await Material.update(req.body, {
      where: {
        id: materialId,
      },
    });
    res.status(200).json({ msg: "Material Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    const material = await Material.findOne({
      where: { id: materialId },
    });

    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }

    await Material.update({ flag: 0 }, { where: { id: materialId } });

    res.status(200).json({ msg: "Material deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
