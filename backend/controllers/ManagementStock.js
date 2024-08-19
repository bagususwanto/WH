import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";
import Location from "../models/LocationModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import LogEntry from "../models/LogEntryModel.js";
import User from "../models/UserModel.js";

export const getInventory = async (req, res) => {
  try {
    const response = await Inventory.findAll({
      attributes: ["id", "quantity", "quantityActual", "remarks",  "createdAt", "updatedAt"],
      include: [
        {
          model: Material,
          attributes: ["id", "materialNo", "description", "uom", "price", "type", "stdStock", "img", "createdAt", "updatedAt"],
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
              model: Category,
              attributes: ["id", "categoryName", "createdAt", "updatedAt"],
            },
            {
              model: Supplier,
              attributes: ["id", "supplierName", "createdAt", "updatedAt"],
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
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
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
      userId: 1,
      detailOrder: null,
      incomingId: null,
    });
    res.status(200).json({ msg: "Inventory Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createIncoming = async (req, res) => {
  try {
    // barang masuk

    // cek apakah sudah ada di inventory atau belum

    // kalau sudah , update quantity

    //kalau belum create new entry

    // insert logEntry
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
