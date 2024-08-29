import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";
import User from "../models/UserModel.js";
import LogImport from "../models/LogImportModel.js";
import { Op } from "sequelize";
import Inventory from "../models/InventoryModel.js";
import LogEntry from "../models/LogEntryModel.js";

export const getIncoming = async (req, res) => {
  try {
    const response = await Incoming.findAll({
      attributes: ["id", "planning", "actual", "createdAt", "updatedAt"],
      include: [
        {
          model: Inventory,
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
          ],
        },
        {
          model: LogImport,
          attributes: ["id", "typeLog", "fileName", "importDate"],
          where: { typeLog: { [Op.in]: ["Incoming Plan", "Incoming Actual"] } },
          include: [
            {
              model: User,
              attributes: ["id", "username", "createdAt", "updatedAt"],
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
              attributes: ["id", "username", "createdAt", "updatedAt"],
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
