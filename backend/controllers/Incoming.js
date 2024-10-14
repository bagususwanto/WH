import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import User from "../models/UserModel.js";
import LogImport from "../models/LogImportModel.js";
import { Op } from "sequelize";
import Inventory from "../models/InventoryModel.js";
import LogEntry from "../models/LogEntryModel.js";

export const getIncoming = async (req, res) => {
  try {
    const response = await Incoming.findAll({
      include: [
        {
          model: Inventory,
          include: [
            {
              model: Material,
              where: { flag: 1 },
              include: [
                {
                  model: Category,
                  where: { flag: 1 },
                },
                {
                  model: Supplier,
                  where: { flag: 1 },
                },
              ],
            },
            {
              model: AddressRack,
              where: { flag: 1 },
              include: [
                {
                  model: Storage,
                  where: { flag: 1 },
                  include: [
                    {
                      model: Plant,
                      where: { flag: 1 },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: LogImport,
          where: { typeLog: { [Op.in]: ["Incoming Plan", "Incoming Actual"] } },
          include: [
            {
              model: User,
              where: { flag: 1 },
              attributes: ["id", "username", "createdAt", "updatedAt"],
            },
          ],
        },
        {
          model: LogEntry,
          attributes: ["id", "createdAt", "updatedAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              where: { flag: 1 },
              attributes: ["id", "username", "createdAt", "updatedAt"],
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
