import db from "../utils/Database.js";
import Incoming from "../models/IncomingModel.js";
import readXlsxFile from "read-excel-file/node";
import Material from "../models/MaterialModel.js";
import AddressRack from "../models/AddressRackModel.js";
import LogImport from "../models/LogImportModel.js";
import { updateStock } from "./ManagementStock.js";
import Inventory from "../models/InventoryModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import LogEntry from "../models/LogEntryModel.js";

export const cancelIncomingPlan = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const incoming = await Incoming.findOne({
      where: {
        id: req.params.id,
      },
      transaction, // menjalankan dalam transaksi
    });

    if (!incoming) {
      await transaction.rollback(); // rollback jika ada kesalahan
      return res.status(404).send({
        status: "error",
        message: "Incoming plan not found",
      });
    }

    const logImport = await LogImport.findOne({
      where: {
        id: incoming.logImportId,
      },
      transaction, // menjalankan dalam transaksi
    });

    if (!logImport) {
      await transaction.rollback(); // rollback jika ada kesalahan
      return res.status(404).send({
        status: "error",
        message: "Log import not found",
      });
    }

    const incomingDate = logImport.importDate;

    const checkActual = await checkActualImport(incomingDate);

    // Cek apakah import sudah aktual
    if (checkActual) {
      await transaction.rollback(); // rollback jika import sudah aktual
      return res.status(400).send({
        status: "error",
        message: "Cannot cancel import. Import already actual",
      });
    } else {
      await Incoming.destroy({
        where: {
          logImportId: incoming.logImportId,
        },
        transaction, // menjalankan dalam transaksi
      });

      await LogEntry.create(
        {
          typeLogEntry: "cancel import",
          userId: req.user.userId,
        },
        { transaction }
      ); // menjalankan dalam transaksi
    }

    await transaction.commit(); // commit transaksi jika semuanya berhasil
    return res.status(200).send({
      status: "success",
      message: "Import canceled successfully",
    });
  } catch (error) {
    await transaction.rollback(); // rollback jika ada kesalahan
    console.error(error.message);
    return res.status(500).send({
      status: "error",
      message: "Failed to cancel import",
    });
  }
};

const checkActualImport = async (importDate) => {
  const logImport = await LogImport.findOne({
    where: {
      importDate,
      typeLog: "incoming actual",
    },
  });

  if (logImport != null) {
    return true;
  }

  return false;
};

export const getMaterialIdByMaterialNo = async (materialNo) => {
  try {
    const material = await Material.findOne({
      where: { materialNo, flag: 1 },
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
      where: { addressRackName, flag: 1 },
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

export const getLastLogImportIdByUserId = async (userId, typeLog, importDate = null) => {
  try {
    // Buat kondisi where yang akan digunakan dalam pencarian
    const whereCondition = { userId, typeLog };

    // Tambahkan kondisi untuk importDate jika diberikan
    if (importDate) {
      whereCondition.importDate = importDate;
    }

    const logImport = await LogImport.findOne({
      where: whereCondition,
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

const checkMaterialNo = async (materialNo) => {
  const existingMaterial = await Material.findOne({
    where: { materialNo, flag: 1 },
  });

  if (!existingMaterial) {
    return false;
  }

  return true;
};

const checkAddressRackName = async (addressRackName) => {
  const existingAddress = await AddressRack.findOne({
    where: { addressRackName, flag: 1 },
  });

  if (!existingAddress) {
    return false;
  }

  return true;
};

const validateHeaderIncoming = (header) => {
  const expectedHeader = ["materialNo", "addressRackName", "planning", "actual"];
  return header.every((value, index) => value.trim().toLowerCase() === expectedHeader[index].toLowerCase());
};

const checkIncomingActualImport = async (importDate) => {
  const incomingImportActual = await LogImport.findOne({
    where: { typeLog: "incoming actual", importDate },
    attributes: ["id"],
  });

  if (!incomingImportActual) {
    return false;
  }

  return true;
};

const checkIncomingPlanImport = async (importDate) => {
  const incomingImportPlan = await LogImport.findOne({
    where: { typeLog: "incoming plan", importDate },
    attributes: ["id"],
  });

  if (!incomingImportPlan) {
    return false;
  }

  return true;
};

const removeWhitespace = (str) => {
  return str.replace(/\s+/g, "");
};

export const uploadIncomingPlan = async (req, res) => {
  const transaction = await db.transaction();

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an excel file!" });
    }

    // jika sudah ada log import actual, tidak boleh upload plan
    const logImportActual = await checkIncomingActualImport(req.body.importDate);
    if (logImportActual == true) {
      return res.status(400).send({ message: "Incoming actual already imported!" });
    }

    // jika sudah ada log import plan  dan tidak ada log import actual, get last log import plan lalu destroy incoming
    const logImportPlan = await checkIncomingPlanImport(req.body.importDate);
    if (logImportPlan == true && logImportActual == false) {
      const logImportId = await getLastLogImportIdByUserId(req.user.userId, "incoming plan", req.body.importDate);
      await Incoming.destroy({ where: { logImportId } });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;

    // Specify the sheet name or index you want to read from
    const sheetName = "incoming";
    const rows = await readXlsxFile(path, { sheet: sheetName });

    const header = rows.shift();

    if (!validateHeaderIncoming(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    // Create a log entry before processing the file
    await LogImport.create({
      typeLog: "incoming plan",
      fileName: req.file.originalname,
      userId: req.user.userId,
      importDate: req.body.importDate,
    });

    // Fetch material and address IDs for all rows
    const incomingPlanPromises = rows.map(async (row) => {
      const materialNoExists = await checkMaterialNo(row[0]);
      if (materialNoExists == false) {
        return res.status(400).send({ message: `Material: ${row[0]} No not found!` });
      }

      const addressRackNameExists = await checkAddressRackName(row[1]);
      if (addressRackNameExists == false) {
        return res.status(400).send({ message: `Address Rack Name: ${row[1]} not found!` });
      }

      const materialId = await getMaterialIdByMaterialNo(removeWhitespace(row[0]));
      const addressId = await getAddressIdByAddressName(removeWhitespace(row[1]));
      const logImportId = await getLastLogImportIdByUserId(req.user.userId, "incoming plan");
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
    res.status(500).send({ message: `Could not upload the file: ${req.file?.originalname}, not matched with expected header!` });
  }
};

export const getLogImportIdByDate = async (importDate) => {
  try {
    const logImport = await LogImport.findOne({
      where: { importDate, typeLog: "incoming plan" },
      order: [["createdAt", "DESC"]],
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
      return res.status(400).send({ message: "Please upload an excel file!" });
    }

    const logImportId = await getLogImportIdByDate(req.body.importDate);
    if (logImportId === null) {
      return res.status(400).send({ message: "Upload incoming plan first" });
    }
    const incomings = await getIncomingByLogImportId(logImportId);

    const path = `./resources/uploads/excel/${req.file.filename}`;

    // Specify the sheet name or index you want to read from
    const sheetName = "incoming";
    const rows = await readXlsxFile(path, { sheet: sheetName });

    // Create a log entry before processing the file
    await LogImport.create({
      typeLog: "incoming actual",
      fileName: req.file.originalname,
      userId: req.user.userId,
      importDate: req.body.importDate,
    });

    // Skip header
    rows.shift();

    // Map incoming data by materialId for quick lookup
    const incomingMap = new Map();
    incomings.forEach((incoming) => {
      incomingMap.set(incoming.inventoryId, incoming);
    });

    // Process each row from the Excel file
    for (const row of rows) {
      const materialId = await getMaterialIdByMaterialNo(removeWhitespace(row[0]));
      const addressId = await getAddressIdByAddressName(removeWhitespace(row[1]));
      const inventoryId = await getInventoryIdByMaterialIdAndAddressId(materialId, addressId);
      const logImportId = await getLastLogImportIdByUserId(req.user.userId, "incoming actual");
      const planningQuantity = row[2];
      const actualQuantity = row[3];

      updateStock(materialId, addressId, actualQuantity, "incoming");

      if (incomingMap.has(inventoryId)) {
        // Update existing incoming record
        const existingIncoming = incomingMap.get(inventoryId);
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

export const getCategoryIdByCategoryName = async (categoryName) => {
  try {
    const category = await Category.findOne({
      where: { categoryName, flag: 1 },
      attributes: ["id"],
    });

    if (!category) {
      console.warn(`Category ${categoryName} not found`);
      return null;
    }

    return category.id;
  } catch (error) {
    console.error(error.message);
    return null; // Return null in case of an error
  }
};

export const getSupplierIdBySupplierName = async (supplierName) => {
  try {
    const supplier = await Supplier.findOne({
      where: { supplierName, flag: 1 },
      attributes: ["id"],
    });

    if (!supplier) {
      console.warn(`Supplier ${supplierName} not found`);
      return null;
    }

    return supplier.id;
  } catch (error) {
    console.error(error.message);
    return null; // Return null in case of an error
  }
};

const validateHeaderMaterial = (header) => {
  const expectedHeader = [
    "materialNo",
    "description",
    "uom",
    "price",
    "type",
    "mrpType",
    "minStock",
    "maxStock",
    "img",
    "minOrder",
    "category",
    "supplier",
  ];
  return header.every((value, index) => value.trim().toLowerCase() === expectedHeader[index].toLowerCase());
};

const BATCH_SIZE = 500; // Set batch size sesuai kebutuhan

export const uploadMasterMaterial = async (req, res) => {
  let transaction, transaction2;
  let materialsCache = null;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";
    const rows = await readXlsxFile(path, { sheet: sheetName });
    const header = rows.shift();

    if (rows.length > 5000) {
      return res.status(400).send({ message: "Batch size exceeds the limit!, max 5000 rows data" });
    }

    if (!validateHeaderMaterial(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    let materialMap;
    if (materialsCache) {
      materialMap = new Map(materialsCache.map((material) => [material.materialNo, material]));
    } else {
      const existingMaterials = await Material.findAll({ where: { flag: 1 } });
      materialsCache = existingMaterials;
      materialMap = new Map(existingMaterials.map((material) => [material.materialNo, material]));
    }

    transaction = await db.transaction();
    const newMaterials = [];

    // Fungsi untuk memproses setiap batch
    const processBatch = async (batch) => {
      const updatePromises = batch.map(async (row) => {
        const materialNo = row[0];
        const existingMaterial = materialMap.get(materialNo);
        const categoryId = await getCategoryIdByCategoryName(row[10]);
        const supplierId = await getSupplierIdBySupplierName(row[11]);

        if (!categoryId) throw new Error(`Category: ${row[10]} does not exist`);
        if (!supplierId) throw new Error(`Supplier: ${row[11]} does not exist`);

        if (!row[0] || !row[1] || !row[2] || !row[4] || !row[5] || !row[8]) {
          throw new Error(`Invalid data in row ${materialNo}, ${row[1]}`);
        }

        if (typeof row[3] !== "number" || typeof row[6] !== "number" || typeof row[7] !== "number" || typeof row[9] !== "number") {
          throw new Error(`Data must be number in row ${materialNo}, ${row[1]}`);
        }

        if (existingMaterial) {
          return existingMaterial.update(
            {
              description: row[1],
              uom: row[2],
              price: row[3],
              type: row[4],
              mrpType: row[5],
              minStock: row[6],
              maxStock: row[7],
              img: row[8],
              minOrder: row[9],
              categoryId,
              supplierId,
            },
            { transaction }
          );
        } else {
          newMaterials.push({
            materialNo,
            description: row[1],
            uom: row[2],
            price: row[3],
            type: row[4],
            mrpType: row[5],
            minStock: row[6],
            maxStock: row[7],
            img: row[8],
            minOrder: row[9],
            categoryId,
            supplierId,
          });
        }
      });

      await Promise.all(updatePromises);
    };

    // Proses data dalam batch
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await processBatch(batch); // Proses batch saat ini
    }

    if (newMaterials.length > 0) {
      await Material.bulkCreate(newMaterials, { transaction });
      await transaction.commit();

      // Logging
      transaction2 = await db.transaction();
      const logImportPromises = newMaterials.map(async (material) => {
        await LogImport.create(
          {
            typeLog: "master material",
            fileName: req.file.originalname,
            userId: req.user.userId,
            importDate: req.body.importDate,
            materialId: await getMaterialIdByMaterialNo(material.materialNo),
          },
          { transaction: transaction2 }
        );
      });
      await Promise.all(logImportPromises);
      await transaction2.commit();
    } else {
      await transaction.commit();
    }

    res.status(200).send({ message: `Uploaded the file successfully: ${req.file.originalname}` });
  } catch (error) {
    if (transaction) await transaction.rollback();
    if (transaction2) await transaction2.rollback();
    console.error(error);
    res.status(500).send({ message: `Could not upload the file: ${req.file?.originalname}. ${error}` });
  }
};
