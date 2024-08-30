import Incoming from "../models/IncomingModel.js";
import readXlsxFile from "read-excel-file/node";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import LogImport from "../models/LogImportModel.js";
import db from "../utils/Database.js";
import { updateStock } from "./ManagementStock.js";
import Inventory from "../models/InventoryModel.js";

export const getMaterialIdByMaterialNo = async (materialNo) => {
  try {
    const material = await Material.findOne({
      where: { materialNo },
      attributes: ["id"],
    });

    if (!material) {
      throw new Error("Material not found");
    }

    return material.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve material ID");
  }
};

export const getAddressIdByAddressName = async (addressRackName) => {
  try {
    const address = await AddressRack.findOne({
      where: { addressRackName },
      attributes: ["id"],
    });

    if (!address) {
      throw new Error("Address not found");
    }

    return address.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve address ID");
  }
};

export const getLastLogImportIdByUserId = async (userId, typeLog) => {
  try {
    const logImport = await LogImport.findOne({
      where: { userId, typeLog },
      attributes: ["id"],
      order: [["id", "DESC"]],
    });

    if (!logImport) {
      throw new Error("LogImport not found");
    }

    return logImport.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve logImport ID");
  }
};

export const getInventoryIdByMaterialIdAndAddressId = async (materialId, addressId) => {
  try {
    const inventory = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["id"],
    });

    if (!inventory) {
      await Inventory.create({ materialId, addressId });
      const newInventory = await Inventory.findOne({
        where: { materialId, addressId },
        attributes: ["id"],
      });
      return newInventory.id;
    } else {
      return inventory.id;
    }
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve inventory ID");
  }
};

const validateHeader = (header) => {
  const expectedHeader = ["materialNo", "addressRackName", "planning", "actual"];
  return header.every((value, index) => value === expectedHeader[index]);
};

export const uploadIncomingPlan = async (req, res) => {
  const transaction = await db.transaction();

  try {
    if (!req.file) {
      return res.status(400).send("Please upload an excel file!");
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;

    const rows = await readXlsxFile(path);

    // Create a log entry before processing the file
    await LogImport.create({
      typeLog: "Incoming Plan",
      fileName: req.file.originalname,
      userId: req.user.userId,
      importDate: req.body.importDate,
    });

    // Skip header
    rows.shift();

    const header = rows.shift();

    if (!validateHeader(header)) {
      return res.status(400).send("Invalid header!");
    }

    // Fetch material and address IDs for all rows
    const incomingPlanPromises = rows.map(async (row) => {
      const materialId = await getMaterialIdByMaterialNo(row[0]);
      const addressId = await getAddressIdByAddressName(row[1]);
      const logImportId = await getLastLogImportIdByUserId(req.user.userId, "Incoming Plan");
      const inventoryId = await getInventoryIdByMaterialIdAndAddressId(materialId, addressId);

      return {
        inventoryId,
        planning: row[2],
        logImportId,
      };
    });

    const incomingPlan = await Promise.all(incomingPlanPromises);

    // Bulk create all incoming plans
    await Incoming.bulkCreate(incomingPlan, { transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}`,
      error: error.message,
    });
  }
};

export const getLogImportIdByDate = async (importDate) => {
  try {
    const logImport = await LogImport.findOne({
      where: { importDate, typeLog: "Incoming Plan" },
      attributes: ["id"],
    });

    if (!logImport) {
      return null;
    }

    return logImport.id;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export const getIncomingByLogImportId = async (logImportId) => {
  try {
    const incoming = await Incoming.findAll({
      where: { logImportId },
    });

    if (!incoming) {
      throw new Error("Incoming not found");
    }

    return incoming;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve incoming ID");
  }
};

export const uploadIncomingActual = async (req, res) => {
  const transaction = await db.transaction();
  try {
    if (!req.file) {
      return res.status(400).send("Please upload an excel file!");
    }

    const logImportId = await getLogImportIdByDate(req.body.importDate);
    if (logImportId === null) {
      return res.status(400).send("Upload incoming plan first");
    }
    const incomings = await getIncomingByLogImportId(logImportId);

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const rows = await readXlsxFile(path);

    // Create a log entry before processing the file
    await LogImport.create({
      typeLog: "Incoming Actual",
      fileName: req.file.originalname,
      userId: req.user.userId,
      importDate: req.body.importDate,
    });

    // Skip header
    rows.shift();

    // Map incoming data by materialId for quick lookup
    const incomingMap = new Map();
    incomings.forEach((incoming) => {
      incomingMap.set(incoming.materialId, incoming);
    });

    // Process each row from the Excel file
    for (const row of rows) {
      const materialId = await getMaterialIdByMaterialNo(row[0]);
      const addressId = await getAddressIdByAddressName(row[1]);
      const inventoryId = await getInventoryIdByMaterialIdAndAddressId(materialId, addressId);
      const logImportId = await getLastLogImportIdByUserId(req.user.userId, "Incoming Actual");
      const planningQuantity = row[2];
      const actualQuantity = row[3];

      updateStock(materialId, addressId, actualQuantity, "incoming");

      if (incomingMap.has(materialId)) {
        // Update existing incoming record
        const existingIncoming = incomingMap.get(materialId);
        await existingIncoming.update({ actual: actualQuantity }, { transaction });
      } else {
        // Create a new incoming record if material ID is not found
        await Incoming.create(
          {
            planning: planningQuantity,
            actual: actualQuantity,
            inventoryId,
            logImportId,
          },
          { transaction }
        );
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}`,
      error: error.message,
    });
  }
};
