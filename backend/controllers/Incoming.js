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

    let whereCondition = {};
    let whereConditionPlant = { flag: 1 };
    let whereConditionStorage = { flag: 1 };

    const { plantId, storageId, startDate, endDate } = req.query;

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    if (storageId) {
      whereConditionStorage.id = storageId;
    }

    if (startDate && endDate) {
      whereCondition.incomingDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    do {
      // Fetch a batch of 1000 records
      batch = await Incoming.findAll({
        limit,
        offset,
        order: [["incomingDate", "ASC"]],
        where: whereCondition,
        include: [
          {
            model: Inventory,
            required: true,
            attributes: ["id"],
            include: [
              {
                model: Material,
                required: true,
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
                required: true,
                include: [
                  {
                    model: Storage,
                    required: true,
                    where: whereConditionStorage,
                    include: [
                      {
                        model: Plant,
                        required: true,
                        where: whereConditionPlant,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: LogImport,
            required: false,
            where: {
              typeLog: { [Op.in]: ["incoming plan", "incoming actual"] },
            },
            include: [
              {
                model: User,
                required: false,
                where: { flag: 1 },
                attributes: ["id", "username"],
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
                attributes: ["id", "username"],
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

    if (!response) {
      return res.status(404).json({ message: "Incoming not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
