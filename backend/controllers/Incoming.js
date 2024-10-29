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
    let response = [];
    let offset = 0;
    const limit = 1000;
    let batch;

    do {
      // Fetch a batch of 1000 records
      batch = await Incoming.findAll({
        limit,
        offset,
        include: [
          {
            model: Inventory,
            attributes: ["id"],
            include: [
              {
                model: Material,
                attributes: ["id", "materialNo", "description", "uom"],
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
            where: { typeLog: { [Op.in]: ["incoming plan", "incoming actual"] } },
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
            attributes: ["id", "userId", "createdAt", "updatedAt"],
            limit: 1,
            order: [["createdAt", "DESC"]],
            required: false,
            include: [
              {
                model: User,
                where: { flag: 1 },
                attributes: ["id", "username", "createdAt", "updatedAt"],
                required: false,
              },
            ],
          },
        ],
      });

      // Add the batch to the response
      response = response.concat(batch);

      // Update offset for the next batch
      offset += limit;
    } while (batch.length === limit); // Continue until we get less than 1000 records

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
