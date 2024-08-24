import Incoming from "../models/IncomingModel.js";
import readXlsxFile from "read-excel-file/node";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import LogImport from "../models/LogImportModel.js";

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
  try {
    if (!req.file) {
      return res.status(400).send("Please upload an excel file!");
    }

    const path = `C:/Project/wh/backend/resources/uploads/excel/${req.file.filename}`;

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
    await Incoming.bulkCreate(incomingPlan);

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}`,
      error: error.message,
    });
  }
};
