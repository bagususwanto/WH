import Material from "../models/MaterialModel.js";
import Plant from "../models/PlantModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import Inventory from "../models/InventoryModel.js";
import Order from "../models/OrderModel.js";
import Approval from "../models/ApprovalModel.js";
import Organization from "../models/OrganizationModel.js";
import Section from "../models/SectionModel.js";
import DetailOrder from "../models/DetailOrderModel.js";

export const getGoodIssue = async (req, res) => {
  try {
    let response = [];
    let offset = 0;
    const limit = 1000;
    let batch;

    let whereCondition = { status: "completed" };
    let whereConditionPlant = { flag: 1 };
    let whereConditionSection = { flag: 1 };

    const { plantId, sectionId, startDate, endDate, status } = req.query;

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    if (sectionId) {
      whereConditionSection.id = sectionId;
    }

    // if (status) {
    //   whereCondition.status = status;
    // }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.transactionDate = {
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
            model: DetailOrder,
            where: { isReject: 0, isDelete: 0 },
            required: true,
            attributes: ["id", "inventoryId", "quantity"],
            include: [
              {
                model: Inventory,
                required: false,
                attributes: ["id"],
                include: [
                  {
                    model: Material,
                    required: false,
                    attributes: ["id", "materialNo", "description", "uom"],
                    where: { flag: 1 },
                  },
                ],
              },
            ],
          },
          {
            model: User,
            where: { flag: 1 },
            attributes: ["id", "username", "createdAt", "updatedAt"],
            required: false,
            include: [
              {
                model: Organization,
                where: { flag: 1 },
                attributes: ["id", "createdAt", "updatedAt"],
                required: false,
                include: [
                  {
                    model: Section,
                    where: whereConditionSection,
                    attributes: ["id", "sectionName", "createdAt", "updatedAt"],
                  },
                  {
                    model: Plant,
                    where: whereConditionPlant,
                    attributes: ["id", "plantName", "createdAt", "updatedAt"],
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
                required: false,
                where: { flag: 1 },
                attributes: ["id", "username"],
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
      return res.status(404).json({ message: "Good issue not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
