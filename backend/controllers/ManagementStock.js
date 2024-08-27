import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import LogEntry from "../models/LogEntryModel.js";
import User from "../models/UserModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";

export const getInventory = async (req, res) => {
  try {
    const response = await Inventory.findAll({
      attributes: ["id", "quantitySistem", "quantityActual", "quantityActualCheck", "remarks", "createdAt", "updatedAt"],
      include: [
        {
          model: Material,
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
        },
        {
          model: AddressRack,
          attributes: ["id", "addressRackName", "createdAt", "updatedAt"],
          include: [
            {
              model: Storage,
              attributes: ["id", "storageName", "createdAt", "updatedAt"],
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
            },
          ],
        },
        {
          model: LogEntry,
          attributes: ["id", "userId", "createdAt", "updatedAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              attributes: ["id", "userName", "createdAt", "updatedAt"],
            },
          ],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;

    if (req.body.quantityActual < 0) {
      return res.status(200).json({ msg: "Quantity not allow under 0" });
    }

    await Inventory.update(req.body, {
      where: {
        id: inventoryId,
      },
    });

    const inventory = await Inventory.findOne({
      where: { id: inventoryId },
    });

    await LogEntry.create({
      inventoryId: inventoryId,
      typeLogEntry: "update",
      quantity: req.body.quantityActual,
      materialId: inventory.materialId,
      userId: req.user.userId,
      detailOrder: null,
      incomingId: null,
    });

    setQuantityActualCheck(inventory.materialId, inventory.addressId);

    res.status(200).json({ msg: "Inventory Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const setQuantityActualCheck = async (materialId, addressId) => {
  try {
    const quantitySistem = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantitySistem"],
    });

    const quantityActual = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantityActual"],
    });

    if (quantityActual.quantityActual == null && quantitySistem.quantitySistem != null) {
      await Inventory.update({ quantityActualCheck: quantitySistem.quantitySistem }, { where: { materialId, addressId } });
      return quantitySistem.quantitySistem;
    } else if (quantityActual.quantityActual != null) {
      await Inventory.update({ quantityActualCheck: quantityActual.quantityActual }, { where: { materialId, addressId } });
      return quantityActual.quantityActual;
    } else {
      await Inventory.update({ quantityActualCheck: 0 }, { where: { materialId, addressId } });
      return 0;
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updateStock = async (materialId, addressId, quantity, type) => {
  try {
    let quantityActualCheck = null;

    await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantityActualCheck"],
    }).then((response) => {
      quantityActualCheck = response.quantityActualCheck;
    });

    if (quantityActualCheck == null) {
      quantityActualCheck = setQuantityActualCheck(materialId, addressId);
    }

    if (type === "incoming") {
      await Inventory.update({ quantitySistem: quantity + quantityActualCheck }, { where: { materialId, addressId } });
    } else if (type === "order") {
      await Inventory.update({ quantitySistem: quantityActualCheck - quantity }, { where: { materialId, addressId } });
    }

    setQuantityActualCheck(materialId, addressId);

    return;
  } catch (error) {
    console.log(error.message);
    return;
  }
};
