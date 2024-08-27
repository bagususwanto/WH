import Incoming from "../models/IncomingModel.js";
import readXlsxFile from "read-excel-file/node";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import LogImport from "../models/LogImportModel.js";
import db from "../utils/Database.js";
import { updateStock } from "./ManagementStock.js";

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

export const getLastLogImportIdByUserId = async (userId) => {
  try {
    const logImport = await LogImport.findOne({
      where: { userId },
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

export const uploadIncomingPlan = async (req, res) => {
  const transaction = await db.transaction();

  try {
    if (!req.file) {
      return res.status(400).send("Please upload an excel file!");
    }

    const filePath = path.join(__basedir, "resources", "uploads", "excel", req.file.filename);

    const rows = await readXlsxFile(filePath);

    // Create a log entry before processing the file
    await LogImport.create(
      {
        typeLog: "Incoming Plan",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    // Skip header
    rows.shift();

    // Fetch material and address IDs for all rows
    const incomingPlanPromises = rows.map(async (row) => {
      const materialId = await getMaterialIdByMaterialNo(row[0]);
      const addressId = await getAddressIdByAddressName(row[1]);
      const logImportId = await getLastLogImportIdByUserId(req.user.userId);

      return {
        materialId,
        addressId,
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
      return res.status(400).send("LogImport not found, please upload an excel plan file first!");
    }
    const incomings = await getIncomingByLogImportId(logImportId);

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const rows = await readXlsxFile(path);

    // Create a log entry before processing the file
    await LogImport.create(
      {
        typeLog: "Incoming Actual",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

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
            materialId,
            addressId,
            planning: planningQuantity,
            actual: actualQuantity,
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
