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
import Order from "../models/OrderModel.js";
import Approval from "../models/ApprovalModel.js";

export const getGoodIssue = async (req, res) => {
  try {
    let response = [];
    let offset = 0;
    const limit = 1000;
    let batch;

    let whereCondition = {};
    let whereConditionPlant = { flag: 1 };
    let whereConditionStorage = { flag: 1 };

    const { plantId, sectionId, startDate, endDate, status } = req.query;

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    if (sectionId) {
      whereConditionStorage.id = sectionId;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = {
        [Op.between]: [start, end],
      };
    }

    do {
      // Fetch a batch of 1000 records
      batch = await Order.findAll({
        limit,
        offset,
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
              },
              {
                model: AddressRack,
                where: { flag: 1 },
                attributes: ["id"],
                required: true,
                include: [
                  {
                    model: Storage,
                    required: true,
                    where: whereConditionStorage,
                    attributes: ["id"],
                    include: [
                      {
                        model: Plant,
                        required: true,
                        where: whereConditionPlant,
                        attributes: ["id", "plantName"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: Approval,
            attributes: ["id", "userId", "status", "createdAt", "updatedAt"],
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
          //   {
          //     model: LogEntry,
          //     attributes: ["id", "userId", "createdAt", "updatedAt"],
          //     limit: 1,
          //     order: [["createdAt", "DESC"]],
          //     required: false,
          //     include: [
          //       {
          //         model: User,
          //         where: { flag: 1 },
          //         attributes: ["id", "username", "createdAt", "updatedAt"],
          //         required: false,
          //       },
          //     ],
          //   },
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
