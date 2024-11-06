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
import Storage from "../models/StorageModel.js";

const BATCH_SIZE = 500; // Set batch size sesuai kebutuhan

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

export const getAddressIdByAddressName = async (addressRackName, storageName, logImportId) => {
  try {
    // Cek apakah address sudah ada
    let address = await AddressRack.findOne({
      where: { addressRackName, flag: 1 },
      attributes: ["id"],
    });

    // Jika tidak ditemukan, buat address baru
    if (!address) {
      const storageId = await getStorageIdByStorageName(storageName);
      address = await AddressRack.create({
        addressRackName,
        storageId,
        logImportId,
      });
    }

    // Kembalikan id dari address yang ditemukan atau yang baru dibuat
    return address.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve or create address ID");
  }
};

export const getStorageIdByStorageName = async (storageName) => {
  try {
    const storage = await Storage.findOne({
      where: { storageName, flag: 1 },
      attributes: ["id"],
    });

    if (!storage) {
      throw new Error(`Storage not found, name: ${storageName}`);
    }

    return storage.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve storage ID");
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
    const [inventory] = await Inventory.findOrCreate({
      where: { materialId, addressId },
      defaults: { materialId, addressId },
    });
    return inventory.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve or create inventory ID");
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

const checkAddressRackName = async (addressRackName, storageName, logImportId) => {
  const existingAddress = await AddressRack.findOne({
    where: { addressRackName, flag: 1 },
  });

  // Jika address tidak ditemukan, buat data baru
  if (!existingAddress) {
    const storageId = await getStorageIdByStorageName(storageName);
    await AddressRack.create({
      addressRackName,
      storageId,
      logImportId,
    });
  }

  return true;
};

const checkStorageName = async (storageName) => {
  const existingStorage = await Storage.findOne({
    where: { storageName, flag: 1 },
  });

  // Jika storage tidak ditemukan, return  false
  if (!existingStorage) {
    return false;
  }

  return true;
};

const validateHeaderIncoming = (header) => {
  const expectedHeader = ["materialNo", "addressRackName", "planning", "actual", "storageName"];
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
  if (!req.file) {
    return res.status(400).send({ message: "Please upload an excel file!" });
  }

  let logImportTransaction;
  let mainTransaction;

  try {
    // Cek import log actual dan log plan
    const logImportActual = await checkIncomingActualImport(req.body.importDate);
    if (logImportActual) {
      return res.status(400).send({ message: "Incoming actual already imported!" });
    }

    const logImportPlan = await checkIncomingPlanImport(req.body.importDate);
    if (logImportPlan && !logImportActual) {
      const logImportId = await getLastLogImportIdByUserId(req.user.userId, "incoming plan", req.body.importDate);
      await Incoming.destroy({ where: { logImportId } });
    }

    // Membuat transaksi untuk LogImport
    logImportTransaction = await db.transaction();
    const logImport = await LogImport.create(
      {
        typeLog: "incoming plan",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction: logImportTransaction }
    );

    // Commit transaksi LogImport
    await logImportTransaction.commit();
    const logImportId = logImport.id;

    // Proses file excel
    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "incoming";
    const rows = await readXlsxFile(path, { sheet: sheetName });

    if (rows.length > 5000) {
      return res.status(400).send({ message: "Batch size exceeds the limit!, max 5000 rows data" });
    }

    const header = rows.shift();
    if (!validateHeaderIncoming(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    // Membuat transaksi utama untuk data Incoming
    mainTransaction = await db.transaction();

    const incomingPlan = [];

    // Proses setiap baris data
    for (const row of rows) {
      const materialNo = row[0];
      if (!row[0] || !row[1] || !row[4] || typeof row[2] !== "number") {
        throw new Error(`Invalid data in row with Material No: ${materialNo}`);
      }

      const materialNoExists = await checkMaterialNo(row[0]);
      if (!materialNoExists) {
        throw new Error(`Material No: ${row[0]} does not exist`);
      }

      const storageExists = await checkStorageName(row[4]);
      if (!storageExists) {
        throw new Error(`Storage Name: ${row[4]} does not exist`);
      }

      await checkAddressRackName(row[1], row[4], logImportId);

      const materialId = await getMaterialIdByMaterialNo(removeWhitespace(row[0]));
      const addressId = await getAddressIdByAddressName(removeWhitespace(row[1]), row[4], logImportId);
      const inventoryId = await getInventoryIdByMaterialIdAndAddressId(materialId, addressId);

      incomingPlan.push({
        inventoryId,
        planning: row[2],
        logImportId,
      });

      if (incomingPlan.length === BATCH_SIZE) {
        await Incoming.bulkCreate(incomingPlan, { transaction: mainTransaction });
        incomingPlan.length = 0;
      }
    }

    if (incomingPlan.length > 0) {
      await Incoming.bulkCreate(incomingPlan, { transaction: mainTransaction });
    }

    // Commit transaksi utama
    await mainTransaction.commit();

    res.status(200).send({ message: `Uploaded the file successfully: ${req.file.originalname}` });
  } catch (error) {
    if (logImportTransaction) await logImportTransaction.rollback();
    if (mainTransaction) await mainTransaction.rollback();
    console.error("File processing error:", error);
    res.status(500).send({ message: `Could not process the file: ${req.file?.originalname}. ${error}` });
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
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an excel file!" });
  }

  try {
    const logImportId = await getLogImportIdByDate(req.body.importDate);
    if (!logImportId) {
      return res.status(400).json({ message: "Upload incoming plan first" });
    }

    const incomings = await getIncomingByLogImportId(logImportId);
    const existingIncomingMap = new Map(incomings.map((incoming) => [incoming.inventoryId, incoming]));

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const rows = await readXlsxFile(path, { sheet: "incoming" });

    if (rows.length > 5000) {
      return res.status(400).json({ message: "Batch size exceeds the limit! Max 5000 rows." });
    }

    const transaction = await db.transaction();
    try {
      const logImport = await LogImport.create(
        {
          typeLog: "incoming actual",
          fileName: req.file.originalname,
          userId: req.user.userId,
          importDate: req.body.importDate,
        },
        { transaction }
      );

      const logImportId = logImport.id;
      rows.shift(); // Skip header row

      const rowsToInsert = [];
      const rowsToUpdate = [];

      for (const row of rows) {
        const [materialNo, address, planningQuantity, actualQuantity, storage] = row;

        if (!materialNo || !address || typeof planningQuantity !== "number" || typeof actualQuantity !== "number" || !storage) {
          console.error(`Invalid row data for Material No: ${materialNo}`);
          continue;
        }

        const materialId = await getMaterialIdByMaterialNo(removeWhitespace(materialNo));
        const addressId = await getAddressIdByAddressName(removeWhitespace(address), storage, logImportId);
        const inventoryId = await getInventoryIdByMaterialIdAndAddressId(materialId, addressId);

        if (!materialId || !addressId || !inventoryId) {
          console.error(`Failed to get necessary IDs for Material No: ${materialNo}`);
          continue;
        }

        await updateStock(materialId, addressId, actualQuantity, "incoming");

        if (existingIncomingMap.has(inventoryId)) {
          const existingIncoming = existingIncomingMap.get(inventoryId);
          existingIncoming.actual = actualQuantity;
          rowsToUpdate.push(existingIncoming);
        } else {
          rowsToInsert.push({
            planning: planningQuantity,
            actual: actualQuantity,
            inventoryId,
            logImportId,
          });
        }
      }

      // Batch update existing records
      for (const incoming of rowsToUpdate) {
        await incoming.save({ transaction });
      }

      // Batch insert new records
      if (rowsToInsert.length > 0) {
        await Incoming.bulkCreate(rowsToInsert, { transaction });
      }

      await transaction.commit();
      res.status(200).json({ message: `Uploaded the file successfully: ${req.file.originalname}` });
    } catch (error) {
      await transaction.rollback();
      console.error("Transaction error:", error);
      res.status(500).json({ message: `Could not upload the file: ${req.file.originalname}. ${error.message}` });
    }
  } catch (error) {
    console.error("File processing error:", error);
    res.status(500).json({ message: `Could not process the file: ${req.file.originalname}. ${error.message}` });
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

export const getSupplierIdBySupplierName = async (SupplierName, logImportId) => {
  try {
    // Cek apakah supplier sudah ada
    let supplier = await Supplier.findOne({
      where: { SupplierName, flag: 1 },
      attributes: ["id"],
    });

    // Jika tidak ditemukan, buat supplier baru
    if (!supplier) {
      supplier = await Supplier.create({
        SupplierName,
        logImportId,
      });
    }

    // Kembalikan id dari supplier yang ditemukan atau yang baru dibuat
    return supplier.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve or create address ID");
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
    "packaging",
    "unitPackaging",
    "category",
    "supplier",
  ];
  return header.every((value, index) => value.trim().toLowerCase() === expectedHeader[index].toLowerCase());
};

// Fungsi checkSupplierName yang diperbarui untuk menggunakan cache
const checkSupplierName = async (supplierName, logImportId, transaction) => {
  const formattedSupplierName = supplierName.trim().toUpperCase();

  try {
    let supplierId;

    // Periksa jika supplierName kosong atau bernilai 0
    if (!formattedSupplierName || formattedSupplierName === "" || formattedSupplierName === 0) {
      console.warn(`Supplier ${formattedSupplierName} not found`);
      return null; // Return null untuk menghentikan eksekusi jika supplierName tidak valid
    }

    const existingSupplier = await Supplier.findOne({
      where: { supplierName: formattedSupplierName, flag: 1 },
    });

    if (existingSupplier) {
      supplierId = existingSupplier.id;
    } else {
      // Jika tidak ditemukan, buat supplier baru
      const newSupplier = await Supplier.create(
        {
          supplierName: formattedSupplierName,
          logImportId,
        },
        { transaction }
      );
      supplierId = newSupplier.id;
    }

    return supplierId;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to check or create supplier");
  }
};

export const uploadMasterMaterial = async (req, res) => {
  let transaction;
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

    transaction = await db.transaction();

    // Buat log untuk seluruh batch impor ini, tanpa materialId
    const logImport = await LogImport.create(
      {
        typeLog: "master material",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );
    const logImportId = logImport.id;

    let materialMap;
    if (materialsCache) {
      materialMap = new Map(materialsCache.map((material) => [material.materialNo, material]));
    } else {
      const existingMaterials = await Material.findAll({ where: { flag: 1 } });
      materialsCache = existingMaterials;
      materialMap = new Map(existingMaterials.map((material) => [material.materialNo, material]));
    }

    const newMaterials = [];

    // 1. Kumpulkan semua nama supplier dari rows
    const supplierNames = new Set(
      rows.map((row) => {
        const supplier = row[13];
        if (!supplier || supplier == "" || supplier == 0) throw new Error(`Supplier ${supplier} not found`);
        return supplier.trim().toUpperCase();
      })
    );

    // 2. Periksa dan simpan ID supplier dalam Map
    const supplierMap = new Map();
    for (const supplierName of supplierNames) {
      const supplierId = await checkSupplierName(supplierName, logImportId, transaction);
      supplierMap.set(supplierName, supplierId);
    }

    const processBatch = async (batch) => {
      const updatePromises = batch.map(async (row) => {
        try {
          const materialNo = row[0];
          const description = row[1];
          const uom = row[2];
          const price = row[3];
          const typeMat = row[4];
          const mrpType = row[5];
          const minStock = row[6];
          const maxStock = row[7];
          const img = row[8];
          const minOrder = row[9];
          const packaging = row[10];
          const unitPackaging = row[11];
          const category = row[12];
          const supplier = row[13];

          const existingMaterial = materialMap.get(materialNo);
          const categoryId = await getCategoryIdByCategoryName(category);

          if (!categoryId) throw new Error(`Category: ${category} does not exist`);

          if (!materialNo || !description || !uom || !typeMat || !mrpType || !img || !category) {
            throw new Error(`Invalid data in row ${materialNo}, ${description}`);
          }

          if (typeof price !== "number" || typeof minStock !== "number" || typeof maxStock !== "number" || typeof minOrder !== "number") {
            throw new Error(`Data must be number in row ${materialNo}, ${description}`);
          }

          if (!supplier || supplier == 0) throw new Error(`Supplier ${supplier} not found`);

          // 3. Dapatkan supplierId dari supplierMap
          const supplierName = supplier.trim().toUpperCase();
          const supplierId = supplierMap.get(supplierName);

          if (existingMaterial) {
            return existingMaterial.update(
              {
                description: description,
                uom: uom,
                price: price,
                type: typeMat,
                mrpType: mrpType,
                minStock: minStock,
                maxStock: maxStock,
                img: img,
                minOrder: minOrder,
                packaging: packaging,
                unitPackaging: unitPackaging,
                categoryId,
                supplierId,
                logImportId,
              },
              { transaction }
            );
          } else {
            newMaterials.push({
              materialNo: materialNo,
              description: description,
              uom: uom,
              price: price,
              type: typeMat,
              mrpType: mrpType,
              minStock: minStock,
              maxStock: maxStock,
              img: img,
              minOrder: minOrder,
              packaging: packaging,
              unitPackaging: unitPackaging,
              categoryId,
              supplierId,
              logImportId,
            });
          }
        } catch (error) {
          console.error(`Error processing row with materialNo ${row[0]}: ${error.message}`);
          throw error;
        }
      });

      await Promise.all(updatePromises);
    };

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await processBatch(batch);
    }

    if (newMaterials.length > 0) {
      await Material.bulkCreate(newMaterials, { transaction });
    }

    await transaction.commit();

    res.status(200).send({ message: `Uploaded the file successfully: ${req.file.originalname}` });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({ message: `Could not upload the file: ${req.file?.originalname}. ${error}` });
  }
};
