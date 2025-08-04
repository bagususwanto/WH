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
import MaterialStorage from "../models/MaterialStorageModel.js";
import Packaging from "../models/PackagingModel.js";
import DeliverySchedule from "../models/DeliveryScheduleModel.js";
import DeliveryNote from "../models/DeliveryNoteModel.js";
import XLSX from "xlsx";
import Plant from "../models/PlantModel.js";
import Division from "../models/DivisionModel.js";
import Department from "../models/DepartmentModel.js";
import Section from "../models/SectionModel.js";
import Group from "../models/GroupModel.js";
import Organization from "../models/OrganizationModel.js";
import User from "../models/UserModel.js";
import Line from "../models/LineModel.js";

const BATCH_SIZE = 1000; // Set batch size sesuai kebutuhan

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

// Fungsi untuk mendapatkan materialId berdasarkan MaterialNo
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

export const getAddressIdByAddressName = async (
  addressRackName
  // storageId,
  // logImportId
) => {
  try {
    // Cek apakah address sudah ada
    let address = await AddressRack.findOne({
      where: {
        addressRackName,
        // storageId,
        flag: 1,
      },
      attributes: ["id"],
    });

    // Jika tidak ditemukan, buat address baru
    if (!address) {
      return false;
      // address = await AddressRack.create({
      //   addressRackName,
      //   storageId,
      //   logImportId,
      // });
    }

    // Kembalikan id dari address yang ditemukan atau yang baru dibuat
    return address.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve or create address ID");
  }
};

export const getStorageIdByStorageCode = async (storageCode) => {
  try {
    const storage = await Storage.findOne({
      where: { storageCode, flag: 1 },
      attributes: ["id"],
    });

    if (!storage) {
      throw new Error(`Storage not found, name: ${storageCode}`);
    }

    return storage.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve storage ID");
  }
};

export const getLastLogImportIdByUserId = async (
  userId,
  typeLog,
  importDate = null
) => {
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

export const getInventoryIdByMaterialIdAndAddressId = async (
  materialId,
  addressId,
  inventoryCache
) => {
  try {
    // Cari data di cache lokal terlebih dahulu
    const cacheKey = `${materialId}-${addressId}`;
    if (inventoryCache[cacheKey]) {
      return inventoryCache[cacheKey];
    }

    // Jika tidak ada di cache, cari di database
    let inventory = await Inventory.findOne({
      where: { materialId },
    });

    if (!inventory) {
      // Jika tidak ditemukan, buat data baru
      inventory = await Inventory.create({ materialId, addressId });
    } else if (inventory.addressId !== addressId) {
      // Jika ditemukan tetapi addressId berbeda, perbarui addressId
      await inventory.update({ addressId });
    }

    // Simpan hasil di cache
    inventoryCache[cacheKey] = inventory.id;

    return inventory.id;
  } catch (error) {
    console.error(error.message);
    throw new Error("Failed to retrieve, update, or create inventory ID");
  }
};

const checkMaterialNo = async (materialNo) => {
  if (!materialNo) {
    throw new Error("Material number is invalid or missing.");
  }

  const existingMaterial = await Material.findOne({
    where: { materialNo, flag: 1 },
  });

  return !!existingMaterial; // Mengembalikan true/false langsung
};

const checkAddressRackName = async (
  addressRackName,
  storageName,
  logImportId
) => {
  const existingAddress = await AddressRack.findOne({
    where: { addressRackName, flag: 1 },
  });

  // Jika address tidak ditemukan, buat data baru
  if (!existingAddress) {
    const storageId = await getStorageIdByStorageCode(storageName);
    await AddressRack.create({
      addressRackName,
      storageId,
      logImportId,
    });
  }

  return true;
};

const checkStorageName = async (storageCode) => {
  const existingStorage = await Storage.findOne({
    where: { storageCode, flag: 1 },
  });

  // Jika storage tidak ditemukan, return  false
  if (!existingStorage) {
    return false;
  }

  return true;
};

const validateHeaderIncoming = (header) => {
  const expectedHeader = [
    "materialNo",
    "addressRackName",
    "planning",
    "actual",
    // "storageCode",
  ];
  return header.every(
    (value, index) =>
      value.trim().toLowerCase() === expectedHeader[index].toLowerCase()
  );
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

  let transaction;

  try {
    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "incoming";
    const rows = await readXlsxFile(path, { sheet: sheetName });

    if (rows.length > 5000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit!, max 5000 rows data" });
    }

    const header = rows.shift();
    if (!validateHeaderIncoming(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    const [logImportActual, logImportPlan] = await Promise.all([
      checkIncomingActualImport(req.body.importDate),
      checkIncomingPlanImport(req.body.importDate),
    ]);

    if (logImportActual) {
      return res
        .status(400)
        .send({ message: "Incoming actual already imported!" });
    }

    if (logImportPlan) {
      const logImportId = await getLastLogImportIdByUserId(
        req.user.userId,
        "incoming plan",
        req.body.importDate
      );
      await Incoming.destroy({ where: { logImportId } });
    }

    const materials = await Material.findAll({
      where: { flag: 1 },
      attributes: ["id", "materialNo"],
    });
    const addresses = await AddressRack.findAll({
      where: { flag: 1 },
      attributes: ["id", "addressRackName"],
    });

    transaction = await db.transaction();

    const logImport = await LogImport.create(
      {
        typeLog: "incoming plan",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportId = logImport.id;
    const inventoryCache = {};
    const materialMap = new Map(materials.map((m) => [m.materialNo, m]));
    const addressMap = new Map(addresses.map((a) => [a.addressRackName, a]));
    const allIncomingPlans = [];

    for (const row of rows) {
      const materialNo = row[0]?.trim();
      const addressName = row[1]?.trim();

      const material = materialMap.get(materialNo);
      const address = addressMap.get(addressName);

      if (!material || !address) {
        throw new Error(
          `Invalid material or address: ${materialNo}, ${addressName}`
        );
      }

      const inventoryId = await getInventoryIdByMaterialIdAndAddressId(
        material.id,
        address.id,
        inventoryCache
      );

      allIncomingPlans.push({
        inventoryId,
        planning: row[2],
        incomingDate: req.body.importDate,
        status: "not complete",
        logImportId,
      });
    }

    await Incoming.bulkCreate(allIncomingPlans, { transaction });
    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("File processing error:", error);
    res.status(500).send({
      message: `Could not process the file: ${req.file?.originalname}. ${error.message}`,
    });
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
    // Check if logImportId exists for the given date
    const logImportId = await getLogImportIdByDate(req.body.importDate);
    if (!logImportId) {
      return res.status(400).json({ message: "Upload incoming plan first" });
    }

    // Retrieve existing incoming records for validation and updates
    const incomings = await getIncomingByLogImportId(logImportId);
    const existingIncomingMap = new Map(
      incomings.map((incoming) => [incoming.inventoryId, incoming])
    );

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const rows = await readXlsxFile(path, { sheet: "incoming" });

    if (rows.length > 5000) {
      return res
        .status(400)
        .json({ message: "Batch size exceeds the limit! Max 5000 rows." });
    }

    const transaction = await db.transaction();
    try {
      // Log the file import
      const logImport = await LogImport.create(
        {
          typeLog: "incoming actual",
          fileName: req.file.originalname,
          userId: req.user.userId,
          importDate: req.body.importDate,
        },
        { transaction }
      );

      const newLogImportId = logImport.id;
      rows.shift(); // Skip header row

      const rowsToInsert = [];
      const rowsToUpdate = [];

      for (const row of rows) {
        const [materialNo, address, planningQuantity, actualQuantity] = row;

        // Validate row data
        if (
          !materialNo ||
          !address ||
          typeof planningQuantity !== "number" ||
          typeof actualQuantity !== "number"
        ) {
          console.error(`Invalid row data for Material No: ${materialNo}`);
          continue;
        }

        // Determine status based on quantities
        const status =
          actualQuantity < planningQuantity ? "partial" : "completed";

        // Fetch IDs for material and address
        const materialId = await getMaterialIdByMaterialNo(
          removeWhitespace(materialNo)
        );
        if (!materialId) {
          throw new Error(`Material No: ${materialNo} not found in database`);
        }

        const addressId = await getAddressIdByAddressName(
          removeWhitespace(address)
        );
        if (!addressId) {
          throw new Error(`Address: ${address} not found in database`);
        }

        const inventoryId = await getInventoryIdByMaterialIdAndAddressId(
          materialId,
          addressId
        );

        if (!inventoryId) {
          console.error(
            `Failed to find inventory for Material No: ${materialNo}`
          );
          continue;
        }

        // Update stock quantity
        await updateStock(materialId, addressId, actualQuantity, "incoming");

        // Prepare rows for insertion or update
        if (existingIncomingMap.has(inventoryId)) {
          const existingIncoming = existingIncomingMap.get(inventoryId);
          existingIncoming.actual = actualQuantity;
          existingIncoming.status = status;
          rowsToUpdate.push(existingIncoming);
        } else {
          rowsToInsert.push({
            planning: planningQuantity,
            actual: actualQuantity,
            inventoryId,
            status,
            logImportId: newLogImportId,
          });
        }
      }

      // Perform batch updates for existing records
      for (const incoming of rowsToUpdate) {
        await incoming.save({ transaction });
      }

      // Perform batch inserts for new records
      if (rowsToInsert.length > 0) {
        await Incoming.bulkCreate(rowsToInsert, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      res.status(200).json({
        message: `Uploaded the file successfully: ${req.file.originalname}`,
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      console.error("Transaction error:", error);
      res.status(500).json({
        message: `Could not upload the file: ${req.file.originalname}. ${error.message}`,
      });
    }
  } catch (error) {
    console.error("File processing error:", error);
    res.status(500).json({
      message: `Could not process the file: ${req.file.originalname}. ${error.message}`,
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

export const getStorageIdByCode = async (storageCode) => {
  try {
    const storage = await Storage.findOne({
      where: { storageCode, flag: 1 },
      attributes: ["id"],
    });

    if (!storage) {
      console.warn(`Storage ${storageCode} not found`);
      return null;
    }

    return storage.id;
  } catch (error) {
    console.error(error.message);
    return null; // Return null in case of an error
  }
};

export const getSupplierIdBySupplierName = async (
  SupplierName,
  logImportId
) => {
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
    "minOrder",
    "packaging",
    "unitPackaging",
    "category",
    "supplierCode",
    "addressRack",
  ];
  return header.every(
    (value, index) =>
      value.trim().toLowerCase() === expectedHeader[index].toLowerCase()
  );
};

// Fungsi checkSupplierName yang diperbarui untuk menggunakan cache
const upsertSuppliers = async (
  supplierNames,
  logImportId,
  userId,
  transaction
) => {
  // Find all suppliers that already exist in the database
  const existingSuppliers = await Supplier.findAll({
    where: { supplierName: Array.from(supplierNames), flag: 1 },
    transaction,
  });

  const existingSupplierMap = new Map(
    existingSuppliers.map((supplier) => [supplier.supplierName, supplier.id])
  );

  const newSuppliers = [];
  const supplierIds = new Map();

  // Separate new suppliers from those that already exist
  Array.from(supplierNames).forEach((name) => {
    if (existingSupplierMap.has(name)) {
      supplierIds.set(name, existingSupplierMap.get(name)); // Use existing supplier ID
    } else {
      newSuppliers.push({ supplierName: name, flag: 1, logImportId });
    }
  });

  // Insert new suppliers in bulk
  if (newSuppliers.length > 0) {
    const createdSuppliers = await Supplier.bulkCreate(newSuppliers, {
      transaction,
    });

    // Map new suppliers to their IDs
    createdSuppliers.forEach((supplier) => {
      supplierIds.set(supplier.supplierName, supplier.id);
    });
  }

  return supplierIds; // Return a map of supplier names to their IDs
};

const checkMaterialStorage = async (
  materialId,
  storageId,
  logImportId,
  userId
) => {
  const materialStorage = await MaterialStorage.findOne({
    where: { materialId, storageId, flag: 1 },
  });
  if (materialStorage) {
    await materialStorage.update(
      {
        storageId: storageId,
        materialId: materialId,
        logImportId: logImportId,
      },
      { userId: userId }
    );
  } else {
    await MaterialStorage.create(
      {
        storageId: storageId,
        materialId: materialId,
        logImportId: logImportId,
      },
      { userId: userId }
    );
  }
};

const checkPackaging = async (
  packaging,
  unitPackaging,
  logImportId,
  userId
) => {
  if (!packaging || !unitPackaging) {
    return null;
  }

  try {
    const packagingRes = await Packaging.findOne(
      {
        where: { packaging, unitPackaging, flag: 1 },
      },
      { userId: userId }
    );
    if (packagingRes) {
      return packagingRes.id;
    } else {
      const packagingData = await Packaging.create(
        {
          packaging,
          unitPackaging,
          logImportId,
        },
        {
          userId: userId,
        }
      );
      return packagingData.id;
    }
  } catch (error) {
    console.error(`Error in checkPackaging: ${error.message}`);
    throw new Error("Failed to process packaging data.");
  }
};

export const uploadMasterMaterial = async (req, res) => {
  let transaction;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";
    const rows = await readXlsxFile(path, { sheet: sheetName });
    const header = rows.shift();

    if (rows.length > 5000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit! Max 5000 rows data" });
    }

    // Kolom yang akan dicek untuk duplikasi, misalnya kolom pertama
    const checkColumnIndex = 0;

    // Gunakan Set untuk memeriksa duplikasi
    const seen = new Set();
    const duplicates = [];

    rows.forEach((row, index) => {
      const key = row[checkColumnIndex]; // Ambil nilai kolom yang akan diperiksa
      if (seen.has(key)) {
        duplicates.push({ rowNumber: index + 2, data: row }); // Simpan informasi duplikat
      } else {
        seen.add(key);
      }
    });

    // Cek hasil
    if (duplicates.length > 0) {
      console.log("Duplicate data found:", duplicates);
      return res.status(400).json({
        message: "Duplicate data found in the file.",
        duplicates,
      });
    }

    if (!validateHeaderMaterial(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    // Create a log for this batch import
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

    // Pre-fetch necessary data
    const [
      existingMaterials,
      existingCategories,
      existingSuppliers,
      existingAddressRacks,
      existingPackagings,
      existingInventories,
    ] = await Promise.all([
      Material.findAll({ where: { flag: 1 }, transaction }),
      Category.findAll({ where: { flag: 1 }, transaction }),
      Supplier.findAll({ where: { flag: 1 }, transaction }),
      AddressRack.findAll({ where: { flag: 1 }, transaction }),
      Packaging.findAll({ where: { flag: 1 }, transaction }),
      Inventory.findAll({ transaction }),
    ]);

    const materialMap = new Map(
      existingMaterials.map((mat) => [mat.materialNo, mat])
    );
    const categoryMap = new Map(
      existingCategories.map((cat) => [cat.categoryName, cat.id])
    );
    const supplierMap = new Map(
      existingSuppliers.map((sup) => [sup.supplierCode, sup.id])
    );
    const addressRackMap = new Map(
      existingAddressRacks.map((addr) => [addr.addressRackName, addr.id])
    );
    const packagingMap = new Map(
      existingPackagings.map((pack) => [
        `${pack.packaging} - ${pack.unitPackaging}`,
        pack.id,
      ])
    );
    const inventoryMap = new Map(
      existingInventories.map((inv) => [inv.materialId, inv])
    );

    const newMaterials = [];
    const updatedMaterials = [];
    const newInventoriesForExistingMaterials = [];
    const updatedInventories = [];
    const newInventoriesForNewMaterials = []; // Untuk material baru
    const validationErrors = [];

    for (const row of rows) {
      try {
        const [
          materialNo,
          description,
          uom,
          price,
          typeMat,
          mrpType,
          minStock,
          maxStock,
          minOrder,
          packaging,
          unitPackaging,
          categoryName,
        ] = row;

        const supplierCode = String(row[12]?.toString().trim());
        const addressRack = row[13];

        if (
          !materialNo ||
          !description ||
          !uom ||
          !typeMat ||
          !mrpType ||
          !categoryName ||
          !categoryName ||
          !supplierCode ||
          !addressRack
        ) {
          throw new Error(
            `Invalid data in row: ${materialNo}, please check your data`
          );
        }

        // check min stock, max stock, price, min order is number
        if (
          isNaN(parseFloat(minStock)) ||
          isNaN(parseFloat(maxStock)) ||
          isNaN(parseFloat(price)) ||
          isNaN(parseFloat(minOrder))
        ) {
          throw new Error(
            `Invalid data in row: ${materialNo}, please check your data`
          );
        }

        // Validate and get category ID
        const categoryId = categoryMap.get(categoryName);
        if (!categoryId)
          throw new Error(
            `Category not found: ${categoryName} in row ${materialNo}, plase check your data master Category`
          );

        // Validate and get supplier ID
        const supplierId = supplierMap.get(supplierCode);
        if (!supplierId)
          throw new Error(
            `Supplier not found: ${supplierCode} in row ${materialNo}, plase check your data master Supplier`
          );

        // Validate and get address ID
        const addressId = addressRackMap.get(addressRack);
        if (!addressId)
          throw new Error(
            `Address not found: ${addressRack} in row ${materialNo}, plase check your data master Address`
          );

        // Validate and get packaging ID
        const packagingId = packagingMap.get(`${packaging} - ${unitPackaging}`);
        if (packaging !== null && unitPackaging !== null && !packagingId) {
          throw new Error(
            `Packaging not found: ${packaging} - ${unitPackaging} in row ${materialNo}, plase check your data master Packaging`
          );
        }

        const existingMaterial = materialMap.get(materialNo);
        const existingInventory = inventoryMap.get(existingMaterial?.id);

        const materialData = {
          materialNo,
          description,
          uom,
          price,
          type: typeMat,
          mrpType,
          minStock,
          maxStock,
          minOrder,
          packagingId,
          categoryId,
          supplierId,
          logImportId,
        };

        if (existingMaterial) {
          // Material sudah ada
          updatedMaterials.push({ ...materialData, id: existingMaterial.id });

          // Cek inventory untuk material yang sudah ada
          if (existingInventory) {
            updatedInventories.push({
              id: existingInventory.id,
              materialId: existingMaterial.id,
              addressId,
            });
          } else {
            // Material ada tapi inventory belum ada
            newInventoriesForExistingMaterials.push({
              materialId: existingMaterial.id,
              addressId,
            });
          }
        } else {
          // Material baru
          newMaterials.push(materialData);
          // Simpan data inventory untuk material baru (akan diproses setelah material dibuat)
          newInventoriesForNewMaterials.push({
            materialNo, // Gunakan materialNo sebagai referensi sementara
            addressId,
          });
        }
      } catch (error) {
        validationErrors.push({ error: error.message });
      }
    }

    // Bulk insert new materials
    let createdMaterials = [];
    if (newMaterials.length > 0) {
      createdMaterials = await Material.bulkCreate(newMaterials, {
        transaction,
        returning: true, // Penting untuk mendapatkan ID yang baru dibuat
      });
    }

    // Bulk update existing materials
    if (updatedMaterials.length > 0) {
      const updatePromises = updatedMaterials.map((mat) =>
        Material.update(mat, { where: { id: mat.id }, transaction })
      );
      await Promise.all(updatePromises);
    }

    // Bulk insert inventories untuk existing materials
    if (newInventoriesForExistingMaterials.length > 0) {
      await Inventory.bulkCreate(newInventoriesForExistingMaterials, {
        transaction,
      });
    }

    // Bulk update existing inventories
    if (updatedInventories.length > 0) {
      const updatePromises = updatedInventories.map((inv) =>
        Inventory.update(inv, { where: { id: inv.id }, transaction })
      );
      await Promise.all(updatePromises);
    }

    // Bulk insert inventories untuk new materials
    if (
      newInventoriesForNewMaterials.length > 0 &&
      createdMaterials.length > 0
    ) {
      // Buat map dari materialNo ke material ID yang baru dibuat
      const newMaterialMap = new Map(
        createdMaterials.map((mat) => [mat.materialNo, mat.id])
      );

      const inventoriesToCreate = newInventoriesForNewMaterials.map((inv) => ({
        materialId: newMaterialMap.get(inv.materialNo),
        addressId: inv.addressId,
      }));

      await Inventory.bulkCreate(inventoriesToCreate, { transaction });
    }

    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      errors: validationErrors.length > 0 ? validationErrors : [],
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${error}`,
    });
  }
};

const validateHeaderAddress = (header) => {
  const expectedHeader = ["address"];
  return header.every(
    (value, index) =>
      value.trim().toLowerCase() === expectedHeader[index].toLowerCase()
  );
};

export const uploadMasterAddress = async (req, res) => {
  let transaction;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";
    const rows = await readXlsxFile(path, { sheet: sheetName });
    const header = rows.shift();

    if (rows.length > 5000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit! Max 5000 rows data." });
    }

    // Kolom yang akan dicek untuk duplikasi, misalnya kolom pertama
    const checkColumnIndex = 0;

    // Gunakan Set untuk memeriksa duplikasi
    const seen = new Set();
    const duplicates = [];

    rows.forEach((row, index) => {
      const key = row[checkColumnIndex]; // Ambil nilai kolom yang akan diperiksa
      if (seen.has(key)) {
        duplicates.push({ rowNumber: index + 2, data: row }); // Simpan informasi duplikat
      } else {
        seen.add(key);
      }
    });

    // Cek hasil
    if (duplicates.length > 0) {
      console.log("Duplicate data found:", duplicates);
      return res.status(400).json({
        message: "Duplicate data found in the file.",
        duplicates,
      });
    }

    if (!validateHeaderAddress(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    // Create a log for this batch import
    const logImport = await LogImport.create(
      {
        typeLog: "master address",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    // Pre-fetch necessary data
    const [existingAddressRacks, existingStorages] = await Promise.all([
      AddressRack.findAll({ where: { flag: 1 }, transaction }),
      Storage.findAll({ where: { flag: 1 }, transaction }),
    ]);

    const addressMap = new Map(
      existingAddressRacks.map((address) => [
        address.addressRackName,
        address.id,
      ])
    );

    const storageMap = new Map(
      existingStorages.map((storage) => [storage.addressCode, storage.id])
    );

    // Prepare data for bulk operations
    const toCreate = [];
    const errors = [];

    for (const [index, row] of rows.entries()) {
      const address = row[0];

      // Validate data
      if (!address) {
        errors.push({ row: index + 2, error: "Invalid data" });
        continue;
      }

      const shortAddressRackName = address.substring(0, 2);
      const storageId = storageMap.get(shortAddressRackName);

      const existingAddress = addressMap.get(address);

      if (!existingAddress) {
        toCreate.push({
          addressRackName: address,
          storageId,
          logImport: logImport.id,
        });
      } else {
        errors.push({ row: index + 2, error: "Address already exists" });
      }
    }

    if (toCreate.length > 0) {
      await AddressRack.bulkCreate(toCreate, { transaction });
    }

    await transaction.commit();

    // Respond with success and error logs
    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      errors,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${error.message}`,
    });
  }
};

const validateHeaderDN = (header) => {
  const expectedHeader = [
    "DN No",
    "Delivery Date",
    "Material No",
    "Quantity",
    "Vendor Code",
  ];

  // Periksa apakah semua kolom yang diharapkan ada dalam header
  return expectedHeader.every((column) =>
    header.some(
      (headerValue) => headerValue.trim().toLowerCase() === column.toLowerCase()
    )
  );
};

export const uploadDeliveryNote = async (req, res) => {
  let transaction;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "DNInquiry";
    const workbook = XLSX.readFile(path);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res
        .status(400)
        .send({ message: `Sheet \"${sheetName}\" not found!` });
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (rows.length <= 1) {
      return res.status(400).send({ message: "No data found in the sheet!" });
    }

    const header = rows.shift();
    if (!validateHeaderDN(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    const logImportDN = await LogImport.create(
      {
        typeLog: "delivery note",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportIncoming = await LogImport.create(
      {
        typeLog: "incoming plan",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    // const dnNumbers = rows.map((row) => row[1]);

    const [existingMaterials, existingInventories, existingSuppliers] =
      await Promise.all([
        Material.findAll({ where: { flag: 1 } }),
        Inventory.findAll(),
        Supplier.findAll({ where: { flag: 1 } }),
      ]);

    const materialMap = new Map(
      existingMaterials.map((mat) => [mat.materialNo, mat.id])
    );
    const inventoryMap = new Map(
      existingInventories.map((inv) => [inv.materialId, inv.id])
    );
    const supplierMap = new Map(
      existingSuppliers.map((sup) => [sup.supplierCode, sup.id])
    );

    const deliveryNoteMap = new Map();
    const incomingMap = new Map();

    const updatedDeliveryNotes = [];
    const newIncomings = [];
    const newDeliveryNotes = [];
    const updatedIncomings = [];
    const validationErrors = [];
    const dnNumberSet = new Set();
    const dnCountMap = {};

    for (const row of rows) {
      try {
        const dnNumber = row[1];
        const deliveryDate = row[4];
        const materialNo = row[9];
        const planning = Number(row[11]?.toString().replace(/,/g, ""));
        const supplierCode = String(row[19]?.toString().trim());

        if (
          !materialNo ||
          !deliveryDate ||
          !dnNumber ||
          !planning ||
          !supplierCode
        ) {
          throw new Error(`Invalid data in row: ${row.join(", ")}`);
        }

        const materialId = materialMap.get(materialNo);
        const inventoryId = inventoryMap.get(materialId);
        const supplierId = supplierMap.get(supplierCode);

        if (!dnNumber || !materialId) continue;
        dnCountMap[dnNumber] = (dnCountMap[dnNumber] || 0) + 1;

        if (!materialId) {
          validationErrors.push({ error: `Material not found: ${materialNo}` });
          continue;
        }
        if (!inventoryId) {
          validationErrors.push({
            error: `Inventory not found for material: ${materialNo}`,
          });
          continue;
        }
        if (!supplierId) {
          validationErrors.push({
            error: `Supplier not found: ${supplierCode}`,
          });
          continue;
        }

        const existingDeliveryNote = await DeliveryNote.findOne({
          where: { dnNumber },
        });

        if (existingDeliveryNote) {
          deliveryNoteMap.set(dnNumber, existingDeliveryNote.id);
          updatedDeliveryNotes.push({
            id: existingDeliveryNote.id,
            dnNumber,
            deliveryDate,
            supplierId,
            totalItems: null,
            logImportId: logImportDN.id,
          });
        } else if (!dnNumberSet.has(dnNumber)) {
          newDeliveryNotes.push({
            dnNumber,
            deliveryDate,
            supplierId,
            totalItems: null,
            logImportId: logImportDN.id,
          });
          dnNumberSet.add(dnNumber); // tandai bahwa dnNumber ini sudah ditambahkan
        }

        let existingIncomingId = incomingMap.get(
          `${inventoryId}-${deliveryDate}`
        );
        if (!existingIncomingId) {
          const existingIncoming = await Incoming.findOne({
            where: { inventoryId, incomingDate: deliveryDate },
          });

          if (existingIncoming) {
            existingIncomingId = existingIncoming.id;
            incomingMap.set(
              `${inventoryId}-${deliveryDate}`,
              existingIncomingId
            );
          }
        }

        if (existingIncomingId) {
          updatedIncomings.push({
            id: existingIncomingId,
            inventoryId,
            planning,
            incomingDate: deliveryDate,
            deliveryNoteId: existingDeliveryNote.id,
            logImportId: logImportIncoming.id,
          });
        } else {
          newIncomings.push({
            inventoryId,
            dnNumber,
            planning,
            incomingDate: deliveryDate,
            status: "not complete",
            deliveryNoteId: null,
            logImportId: logImportIncoming.id,
          });
        }
      } catch (error) {
        validationErrors.push({ error: error.message });
      }
    }

    // Update `newDeliveryNotes` dengan `totalItems`
    for (const note of newDeliveryNotes) {
      note.totalItems = dnCountMap[note.dnNumber] || 1;
    }

    // Update `updateDeliveryNotes` dengan `totalItems`
    for (const note of updatedDeliveryNotes) {
      note.totalItems = dnCountMap[note.dnNumber] || 1;
    }

    if (newDeliveryNotes.length > 0) {
      const createdNotes = await DeliveryNote.bulkCreate(newDeliveryNotes, {
        transaction,
        returning: true, // Mendapatkan kembali ID hasil insert
      });

      // Update mapping dengan ID hasil insert
      for (const note of createdNotes) {
        deliveryNoteMap.set(note.dnNumber, note.id);
      }
    }

    // Update `newIncomings` dengan ID yang benar dari `deliveryNoteMap`
    for (const inc of newIncomings) {
      inc.deliveryNoteId = deliveryNoteMap.get(inc.dnNumber);
    }

    // Insert semua `Incoming` baru sekaligus
    if (newIncomings.length > 0) {
      await Incoming.bulkCreate(
        newIncomings.map((inc) => ({
          planning: inc.planning,
          inventoryId: inc.inventoryId,
          logImportId: inc.logImportId,
          incomingDate: inc.incomingDate,
          status: inc.status,
          deliveryNoteId: inc.deliveryNoteId,
        })),
        { transaction }
      );
    }

    if (updatedDeliveryNotes.length > 0) {
      for (const dn of updatedDeliveryNotes) {
        await DeliveryNote.update(
          {
            deliveryDate: dn.deliveryDate,
            supplierId: dn.supplierId,
            logImportId: dn.logImportId,
          },
          {
            where: { id: dn.id },
            transaction,
          }
        );
      }
    }

    if (updatedIncomings.length > 0) {
      for (const inc of updatedIncomings) {
        await Incoming.update(
          {
            inventoryId: inc.inventoryId,
            planning: inc.planning,
            incomingDate: inc.incomingDate,
            deliveryNoteId: inc.deliveryNoteId,
          },
          {
            where: { id: inc.id },
            transaction,
          }
        );
      }
    }

    await transaction.commit();
    res.status(200).send({
      message: `Uploaded successfully: ${req.file.originalname}`,
      errors: validationErrors.length > 0 ? validationErrors : "",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).send({
      message: `Could not upload: ${req.file?.originalname}. ${error.message}`,
    });
  }
};

const validateHeaderDeliverySchedule = (header) => {
  const expectedHeader = [
    "supplierCode",
    "schedule(day)",
    "arrival(time)",
    "departure(time)",
    "truckStation",
    "rit",
    "plantCode",
  ];
  return header.every(
    (value, index) =>
      value.trim().toLowerCase() === expectedHeader[index].toLowerCase()
  );
};

const cleanAndUppercaseData = (data) => {
  // Gunakan RegExp untuk menghapus semua simbol kecuali huruf dan angka
  return data.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
};

const formatTime = (dateTime) => {
  if (!dateTime) return null;

  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return dateTime; // Jika bukan tanggal valid, kembalikan apa adanya

  return date.toISOString().split("T")[1].split(".")[0]; // Format ke HH:mm:ss
};

export const uploadMasterDeliverySchedule = async (req, res) => {
  let transaction;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";
    const rows = await readXlsxFile(path, { sheet: sheetName });
    const header = rows.shift();

    if (rows.length > 5000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit! Max 5000 rows data" });
    }

    // Kolom yang akan dicek untuk duplikasi, misalnya kolom pertama
    const checkColumnSupplier = 0;
    const checkColumnSchedule = 1;
    const checkColumnTruckStation = 4;
    const checkColumnRit = 5;
    const checkColumnPlant = 6;

    // Gunakan Set untuk memeriksa duplikasi
    const seen = new Set();
    const duplicates = [];

    rows.forEach((row, index) => {
      const key = `${row[checkColumnSupplier]}-${row[checkColumnSchedule]}-${row[checkColumnRit]}-${row[checkColumnPlant]}-${row[checkColumnTruckStation]}`; // Ambil nilai kolom yang akan diperiksa
      if (seen.has(key)) {
        duplicates.push({ rowNumber: index + 2, data: row }); // Simpan informasi duplikat
      } else {
        seen.add(key);
      }
    });

    // Cek hasil
    if (duplicates.length > 0) {
      console.log("Duplicate data found:", duplicates);
      return res.status(400).json({
        message: "Duplicate data found in the file.",
        duplicates,
      });
    }

    if (!validateHeaderDeliverySchedule(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    // Create a log for this batch import
    const logImport = await LogImport.create(
      {
        typeLog: "master delivery schedule",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportId = logImport.id;

    // Pre-fetch necessary data
    const [existingSuppliers, existingDeliverySchedules, existingPlants] =
      await Promise.all([
        Supplier.findAll({ where: { flag: 1 } }),
        DeliverySchedule.findAll({ where: { flag: 1 } }),
        Plant.findAll({ where: { flag: 1 } }),
      ]);

    const supplierMap = new Map(
      existingSuppliers.map((sup) => [sup.supplierCode, sup.id])
    );

    const deliveryScheduleMap = new Map(
      existingDeliverySchedules.map((ds) => [
        `${ds.supplierId}-${ds.schedule}-${ds.rit}-${ds.plantId}`,
        ds,
      ])
    );

    const plantMap = new Map(
      existingPlants.map((plant) => [plant.plantCode, plant.id])
    );

    const daysMap = new Map([
      ["MINGGU", 0],
      ["SENIN", 1],
      ["SELASA", 2],
      ["RABU", 3],
      ["KAMIS", 4],
      ["JUMAT", 5],
      ["SABTU", 6],
    ]);

    const newDeliverySchedules = [];
    const updatedDeliverySchedules = [];
    const validationErrors = [];

    for (const row of rows) {
      try {
        const supplierCode = String(row[0]?.toString().trim());
        const schedule = cleanAndUppercaseData(row[1]);
        const arrival = formatTime(row[2]);
        const departure = formatTime(row[3]);
        const truckStation = row[4];
        const rit = row[5];
        const plantCode = row[6];

        if (
          !supplierCode ||
          !schedule ||
          !arrival ||
          !departure ||
          !truckStation ||
          !rit ||
          !plantCode
        ) {
          throw new Error(
            `Invalid data in row for supplierCode: ${supplierCode}`
          );
        }

        // Validate and get supplier ID
        const supplierId = supplierMap.get(supplierCode);
        if (!supplierId) throw new Error(`Supplier not found: ${supplierCode}`);

        const plantId = plantMap.get(plantCode);
        if (!plantId) throw new Error(`Plant not found: ${plantCode}`);

        const scheduleCode = daysMap.get(schedule);
        const supplierIdScheduleRitTruckstationAndPlant = `${supplierId}-${scheduleCode}-${rit}-${plantId}-${truckStation}`;

        const existingDeliverySchedule = deliveryScheduleMap.get(
          supplierIdScheduleRitTruckstationAndPlant
        );

        const deliveryScheduleData = {
          supplierId,
          schedule: scheduleCode,
          arrival,
          departure,
          truckStation,
          rit,
          plantId,
          logImportId,
        };

        if (existingDeliverySchedule) {
          updatedDeliverySchedules.push({
            ...deliveryScheduleData,
            id: existingDeliverySchedule.id,
          });
        } else {
          newDeliverySchedules.push(deliveryScheduleData);
        }
      } catch (error) {
        validationErrors.push({ error: error.message });
      }
    }

    // Bulk insert new materials
    if (newDeliverySchedules.length > 0) {
      await DeliverySchedule.bulkCreate(newDeliverySchedules, { transaction });
    }

    // Bulk update existing materials
    if (updatedDeliverySchedules.length > 0) {
      const updatePromises = updatedDeliverySchedules.map((ds) =>
        DeliverySchedule.update(
          {
            ...ds,
            arrival: ds.arrival,
            departure: ds.departure,
            truckStation: ds.truckStation,
          },
          { where: { id: ds.id }, transaction }
        )
      );
      await Promise.all(updatePromises);
    }

    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      errors: validationErrors.length > 0 ? validationErrors : "",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${error}`,
    });
  }
};

const validateHeaderMappingMaterialAddress = (header) => {
  const expectedHeader = ["materialNo", "addressRackName"];
  return header.every(
    (value, index) =>
      value.trim().toLowerCase() === expectedHeader[index].toLowerCase()
  );
};

export const uploadMappingMaterialAddress = async (req, res) => {
  let transaction;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";
    const rows = await readXlsxFile(path, { sheet: sheetName });
    const header = rows.shift();

    if (rows.length > 5000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit! Max 5000 rows data" });
    }

    // Kolom yang akan dicek untuk duplikasi, misalnya kolom pertama
    const checkColumnIndex = 0;

    // Gunakan Set untuk memeriksa duplikasi
    const seen = new Set();
    const duplicates = [];

    rows.forEach((row, index) => {
      const key = row[checkColumnIndex]; // Ambil nilai kolom yang akan diperiksa
      if (seen.has(key)) {
        duplicates.push({ rowNumber: index + 2, data: row }); // Simpan informasi duplikat
      } else {
        seen.add(key);
      }
    });

    // Cek hasil
    if (duplicates.length > 0) {
      console.log("Duplicate data found:", duplicates);
      return res.status(400).json({
        message: "Duplicate data found in the file.",
        duplicates,
      });
    }

    if (!validateHeaderMappingMaterialAddress(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    // Create a log for this batch import
    const logImportInventory = await LogImport.create(
      {
        typeLog: "mapping material address",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportMaterialStorage = await LogImport.create(
      {
        typeLog: "master material storage",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportAddress = await LogImport.create(
      {
        typeLog: "master address",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    // Pre-fetch necessary data
    const [
      existingInventories,
      exsitingMaterials,
      existingAddressRacks,
      existingMaterialStorages,
      existingStorages,
    ] = await Promise.all([
      Inventory.findAll({ transaction }),
      Material.findAll({ where: { flag: 1 }, transaction }),
      AddressRack.findAll({ where: { flag: 1 }, transaction }),
      MaterialStorage.findAll({ where: { flag: 1 }, transaction }),
      Storage.findAll({ where: { flag: 1 }, transaction }),
    ]);

    const inventoryMap = new Map(
      existingInventories.map((inv) => [inv.materialId, inv])
    );

    const materialMap = new Map(
      exsitingMaterials.map((material) => [material.materialNo, material.id])
    );

    const addressRackMap = new Map(
      existingAddressRacks.map((addressRack) => [
        addressRack.addressRackName,
        addressRack,
      ])
    );

    const materialStorageMap = new Map(
      existingMaterialStorages.map((ms) => [ms.materialId, ms])
    );

    const storageMap = new Map(
      existingStorages.map((storage) => [storage.addressCode, storage.id])
    );

    const newInventories = [];
    const updatedInventories = [];
    const newMaterialStorages = [];
    const updatedMaterialStorages = [];
    const newAddressRacks = [];
    const updatedAddressRacks = [];
    const validationErrors = [];

    for (const row of rows) {
      try {
        const [materialNo, addressRackName] = row;

        if (!materialNo || !addressRackName) {
          throw new Error(
            `Invalid data in row for materialNo: ${materialNo} and addressRackName: ${addressRackName}`
          );
        }

        const materialId = materialMap.get(materialNo);
        if (!materialId) throw new Error(`Material not found: ${materialNo}`);

        const address = addressRackMap.get(addressRackName);
        if (!address)
          throw new Error(`Address rack not found: ${addressRackName}`);

        const shortAddressRackName = addressRackName.substring(0, 2);
        const storageId = storageMap.get(shortAddressRackName);
        if (!storageId)
          throw new Error(
            `Storage not found for addressRackName: ${addressRackName}`
          );

        const existingInventory = inventoryMap.get(materialId);

        const existingMaterialStorage = materialStorageMap.get(materialId);

        const existingAddressRack = addressRackMap.get(addressRackName);

        const inventoryData = {
          materialId,
          addressId: address.id,
          logImportId: logImportInventory.id,
        };

        const materialStorageData = {
          materialId,
          storageId,
          logImportId: logImportMaterialStorage.id,
        };

        const addressRackData = {
          addressRackName,
          storageId,
          logImportId: logImportAddress.id,
        };

        if (existingInventory) {
          updatedInventories.push({
            ...inventoryData,
            id: existingInventory.id,
          });
        } else {
          newInventories.push(inventoryData);
        }

        if (existingMaterialStorage) {
          updatedMaterialStorages.push(materialStorageData);
        } else {
          newMaterialStorages.push(materialStorageData);
        }

        if (existingAddressRack) {
          updatedAddressRacks.push({
            ...addressRackData,
            id: existingAddressRack.id,
          });
        } else {
          newAddressRacks.push(addressRackData);
        }
      } catch (error) {
        validationErrors.push({ error: error.message });
      }
    }

    // Bulk insert new inventories
    if (newInventories.length > 0) {
      await Inventory.bulkCreate(newInventories, { transaction });
    }

    // Promise all update existing inventories
    if (updatedInventories.length > 0) {
      await Promise.all(
        updatedInventories.map((inventory) =>
          Inventory.update(
            {
              materialId: inventory.materialId,
              addressId: inventory.addressId,
              logImportId: logImportInventory.id,
            },
            { where: { id: inventory.id }, transaction }
          )
        )
      );
    }

    // Promise all update existing material storages
    if (updatedMaterialStorages.length > 0) {
      await Promise.all(
        updatedMaterialStorages.map((materialStorage) =>
          MaterialStorage.update(
            {
              logImportId: materialStorage.logImportId,
            },
            {
              where: {
                materialId: materialStorage.materialId,
                storageId: materialStorage.storageId,
                flag: 1,
              },
              transaction,
            }
          )
        )
      );
    }

    // Bulk insert new material storages
    if (newMaterialStorages.length > 0) {
      await MaterialStorage.bulkCreate(newMaterialStorages, { transaction });
    }

    // Bulk insert new address racks
    if (newAddressRacks.length > 0) {
      await AddressRack.bulkCreate(newAddressRacks, { transaction });
    }

    // Promise all update existing address racks
    if (updatedAddressRacks.length > 0) {
      await Promise.all(
        updatedAddressRacks.map((addressRack) =>
          AddressRack.update(
            {
              addressRackName: addressRack.addressRackName,
              storageId: addressRack.storageId,
              logImportId: logImportAddress.id,
            },
            { where: { id: addressRack.id }, transaction }
          )
        )
      );
    }

    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      errors: validationErrors.length > 0 ? validationErrors : "",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${error}`,
    });
  }
};

const validateHeaderStockIWMS = (header) => {
  const expectedHeader = ["materialNo", "SoH"];

  // Periksa apakah semua kolom yang diharapkan ada dalam header
  return expectedHeader.every((column) =>
    header.some(
      (headerValue) => headerValue.trim().toLowerCase() === column.toLowerCase()
    )
  );
};

export const uploadStockIWMS = async (req, res) => {
  let transaction;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";

    // Read the Excel file
    const workbook = XLSX.readFile(path);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res
        .status(400)
        .send({ message: `Sheet "${sheetName}" not found!` });
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length <= 1) {
      return res.status(400).send({ message: "No data found in the sheet!" });
    }

    const header = rows.shift();

    if (rows.length > 15000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit! Max 5000 rows data" });
    }

    // Kolom yang akan dicek untuk duplikasi, misalnya kolom pertama
    const checkColumnMaterialNo = 0;

    // Gunakan Set untuk memeriksa duplikasi
    const seen = new Set();
    const duplicates = [];

    rows.forEach((row, index) => {
      const key = `${row[checkColumnMaterialNo]}`; // Ambil nilai kolom yang akan diperiksa
      if (seen.has(key)) {
        duplicates.push({
          rowNumber: index + 1,
          data: row,
        }); // Simpan informasi duplikat
      } else {
        seen.add(key);
      }
    });

    // Cek hasil
    if (duplicates.length > 0) {
      console.log("Duplicate data found:", duplicates);
      return res.status(400).json({
        message: "Duplicate data found in the file.",
        duplicates,
      });
    }

    if (!validateHeaderStockIWMS(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    // Create a log for this batch import
    const logImport = await LogImport.create(
      {
        typeLog: "stock iwms",
        fileName: req.file.originalname,
        userId: req.user.userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportId = logImport.id;

    // Pre-fetch necessary data
    const [existingMaterials] = await Promise.all([
      Material.findAll({ where: { flag: 1, type: "DIRECT" } }),
    ]);

    const materialMap = new Map(
      existingMaterials.map((mat) => [mat.materialNo, mat.id])
    );

    const updatedSohs = [];
    const validationErrors = [];

    for (const row of rows) {
      try {
        const materialNo = row[0]?.trim();
        const soh = row[1];

        if (!materialNo) {
          throw new Error(`Invalid data in row for material: ${materialNo}`);
        }

        if (soh !== parseInt(soh)) {
          throw new Error(
            `Invalid data in row for material: ${materialNo}, soh must be integer`
          );
        }

        // get material id
        const materialId = materialMap.get(materialNo);

        if (materialId) {
          updatedSohs.push({
            materialId,
            soh,
            logImportId,
          });
        }
      } catch (error) {
        validationErrors.push({ error: error.message });
      }
    }

    // Bulk update existing materials
    if (updatedSohs.length > 0) {
      const updatePromises = updatedSohs.map((soh) =>
        Inventory.update(
          {
            soh: soh.soh,
            logImportId: soh.logImportId,
          },
          { where: { materialId: soh.materialId }, transaction }
        )
      );
      await Promise.all(updatePromises);
    }

    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      errors: validationErrors.length > 0 ? validationErrors : "",
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${error}`,
    });
  }
};

const validateHeaderUserHR = (header) => {
  const expectedHeader = [
    "Name",
    "Noreg",
    "Unit Code",
    "Jabatan",
    "Division",
    "Department",
    "Section",
    "Line",
    "Group",
    "Lokasi",
  ];
  return header.every(
    (value, index) =>
      value.trim().toLowerCase() === expectedHeader[index].toLowerCase()
  );
};

export const uploadUserHR = async (req, res) => {
  let transaction;
  const userId = req.user.userId;

  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an Excel file!" });
    }

    const path = `./resources/uploads/excel/${req.file.filename}`;
    const sheetName = "template";
    const rows = await readXlsxFile(path, { sheet: sheetName });
    const header = rows.shift();

    if (rows.length > 10000) {
      return res
        .status(400)
        .send({ message: "Batch size exceeds the limit! Max 5000 rows data" });
    }

    // Kolom yang akan dicek untuk duplikasi, misalnya kolom pertama
    const checkColumnIndex = 1;

    // Gunakan Set untuk memeriksa duplikasi
    const seen = new Set();
    const duplicates = [];

    rows.forEach((row, index) => {
      const key = row[checkColumnIndex]; // Ambil nilai kolom yang akan diperiksa
      if (seen.has(key)) {
        duplicates.push({ rowNumber: index + 2, data: row }); // Simpan informasi duplikat
      } else {
        seen.add(key);
      }
    });

    // Cek hasil
    if (duplicates.length > 0) {
      console.log("Duplicate data found:", duplicates);
      return res.status(400).json({
        message: "Duplicate data found in the file.",
        duplicates,
      });
    }

    if (!validateHeaderUserHR(header)) {
      return res.status(400).send({ message: "Invalid header!" });
    }

    transaction = await db.transaction();

    // Create a log for this batch import
    const logImport = await LogImport.create(
      {
        typeLog: "master user-organization",
        fileName: req.file.originalname,
        userId,
        importDate: req.body.importDate,
      },
      { transaction }
    );

    const logImportId = logImport.id;

    // Pre-fetch necessary data
    const [
      existingUsers,
      existingDivisions,
      existingDepartments,
      existingSections,
      existingLines,
      existingGroups,
      existingOrganizations,
      existingPlants,
    ] = await Promise.all([
      User.findAll({ transaction }),
      Division.findAll({ where: { flag: 1 }, transaction }),
      Department.findAll({ where: { flag: 1 }, transaction }),
      Section.findAll({ where: { flag: 1 }, transaction }),
      Line.findAll({ where: { flag: 1 }, transaction }),
      Group.findAll({ where: { flag: 1 }, transaction }),
      Organization.findAll({ where: { flag: 1 }, transaction }),
      Plant.findAll({ where: { flag: 1 }, transaction }),
    ]);

    const userMap = new Map(existingUsers.map((user) => [user.noreg, user]));
    const divisionMap = new Map(
      existingDivisions.map((div) => [div.divisionName, div.id])
    );
    const departmentMap = new Map(
      existingDepartments.map((dep) => [dep.departmentName, dep.id])
    );
    const sectionMap = new Map(
      existingSections.map((sec) => [sec.sectionName, sec.id])
    );
    const lineMap = new Map(
      existingLines.map((line) => [line.lineName, line.id])
    );
    const groupMap = new Map(
      existingGroups.map((group) => [group.groupName, group.id])
    );
    const organizationMap = new Map(
      existingOrganizations.map((org) => [org.unitCode, org.id])
    );
    const plantMap = new Map(
      existingPlants.map((plant) => [plant.plantName, plant.id])
    );

    const newUsers = [];
    const updatedUsers = [];
    const validationErrors = [];
    const organizationCache = new Map(); // Cache untuk organization yang baru dibuat

    for (const row of rows) {
      try {
        const [
          name,
          noreg,
          unitCode,
          jabatan,
          division,
          department,
          section,
          line,
          group,
          lokasi,
        ] = row;

        if (!name || !noreg || !unitCode || !jabatan || !lokasi) {
          throw new Error(`Invalid data in row: ${row.join(", ")}`);
        }

        let divisionId = divisionMap.get(division) || null;
        if (!divisionId && division) {
          const newDivision = await Division.create(
            {
              divisionName: division,
            },
            { transaction, userId }
          );
          divisionId = newDivision.id;
          divisionMap.set(division, divisionId);
        }

        let departmentId = departmentMap.get(department) || null;
        if (!departmentId && department) {
          const newDepartment = await Department.create(
            {
              departmentName: department,
            },
            { transaction, userId }
          );
          departmentId = newDepartment.id;
          departmentMap.set(department, departmentId);
        }

        let sectionId = sectionMap.get(section) || null;
        if (!sectionId && section) {
          const newSection = await Section.create(
            {
              sectionName: section,
            },
            { transaction, userId }
          );
          sectionId = newSection.id;
          sectionMap.set(section, sectionId);
        }

        let lineId = lineMap.get(line) || null;
        if (!lineId && line) {
          const newLine = await Line.create(
            {
              lineName: line,
            },
            { transaction, userId }
          );
          lineId = newLine.id;
          lineMap.set(line, lineId);
        }

        let groupId = groupMap.get(group) || null;
        if (!groupId && group) {
          const newGroup = await Group.create(
            {
              groupName: group,
            },
            { transaction, userId }
          );
          groupId = newGroup.id;
          groupMap.set(group, groupId);
        }

        const plantId = plantMap.get(lokasi);
        if (!plantId) throw new Error(`Plant not found: ${lokasi}`);

        let organizationId = organizationMap.get(unitCode);

        // Cek juga di cache untuk organization yang baru dibuat dalam loop ini
        if (!organizationId) {
          organizationId = organizationCache.get(unitCode);
        }

        if (!organizationId) {
          // Create organization immediately
          const newOrganization = await Organization.create(
            {
              unitCode,
              divisionId,
              departmentId,
              sectionId,
              lineId,
              groupId,
              plantId,
              logImportId,
            },
            { transaction, userId }
          );

          organizationId = newOrganization.id;

          // Update cache dan map
          organizationCache.set(unitCode, organizationId);
          organizationMap.set(unitCode, organizationId);
        }

        const existingUser = userMap.get(noreg);
        const userData = {
          username: noreg.slice(1), // hanya ambil digit ke-2 sampai digit akhir
          password: noreg.slice(1), // Sementara menggunakan noreg sebagai password
          name,
          noreg,
          img: `https://hrportal.toyota.co.id/Content/images/${noreg}.jpg`,
          position: jabatan,
          organizationId,
          plantId,
          logImportId,
        };

        if (existingUser) {
          // User sudah ada, update
          updatedUsers.push({ ...userData, id: existingUser.id });
        } else {
          // User baru
          newUsers.push(userData);
        }
      } catch (error) {
        validationErrors.push({ error: error.message });
      }
    }

    // Bulk insert new users
    if (newUsers.length > 0) {
      await User.bulkCreate(
        newUsers.map((user) => ({
          ...user,
          flag: 0,
        })),
        {
          transaction,
        }
      );
    }

    // Bulk update existing users
    if (updatedUsers.length > 0) {
      const updatePromises = updatedUsers.map((user) =>
        User.update(user, { where: { id: user.id }, transaction })
      );
      await Promise.all(updatePromises);
    }

    await transaction.commit();

    res.status(200).send({
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      errors: validationErrors.length > 0 ? validationErrors : [],
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).send({
      message: `Could not upload the file: ${req.file?.originalname}. ${error}`,
    });
  }
};
