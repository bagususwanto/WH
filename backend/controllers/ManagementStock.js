import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Incoming from "../models/IncomingModel.js";
import LogEntry from "../models/LogEntryModel.js";
import User from "../models/UserModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import { Op } from "sequelize";
import db from "../utils/Database.js";
import Packaging from "../models/PackagingModel.js";

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0); // Mengatur waktu ke 00:00:00

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999); // Mengatur waktu ke 23:59:59

export const getInventory = async (req, res) => {
  const limit = 1000; // Tentukan jumlah data per batch
  let offset = 0;
  let hasMoreData = true;
  let allData = []; // Variabel untuk menyimpan semua data

  const { storageId, plantId, type } = req.query;

  let whereCondition = { flag: 1 };
  let whereConditionStorage = { flag: 1 };
  let whereConditionPlant = { flag: 1 };

  if (type) {
    whereCondition.type = type;
  }

  if (storageId) {
    whereConditionStorage.id = storageId;
  }

  if (plantId) {
    whereConditionPlant.id = plantId;
  }

  try {
    while (hasMoreData) {
      // Mengambil data dalam batch
      const batchData = await Inventory.findAll({
        include: [
          {
            model: Material,
            attributes: [
              "id",
              "materialNo",
              "description",
              "minStock",
              "maxStock",
              "uom",
              "type",
              "mrpType",
              "packagingId",
            ],
            where: whereCondition,
            include: [
              {
                model: Packaging,
                attributes: ["id", "packaging", "unitPackaging"],
              },
            ],
          },
          {
            model: AddressRack,
            attributes: ["id", "addressRackName"],
            where: { flag: 1 },
            include: [
              {
                model: Storage,
                attributes: ["id", "storageName"],
                where: whereConditionStorage,
                include: [
                  {
                    model: Plant,
                    attributes: ["id", "plantName"],
                    where: whereConditionPlant,
                  },
                ],
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
                attributes: ["id", "username", "createdAt", "updatedAt"],
                where: { flag: 1 },
                required: false,
              },
            ],
          },
          {
            model: Incoming,
            limit: 1,
            order: [["createdAt", "DESC"]],
            where: {
              createdAt: {
                [Op.between]: [startOfToday, endOfToday],
              },
            },
          },
        ],
        limit,
        offset, // Mulai dari batch tertentu
      });

      // Tambahkan data batch ke allData
      allData = allData.concat(batchData);

      // Jika jumlah data yang diambil kurang dari limit, tidak ada lagi data yang tersisa
      if (batchData.length < limit) {
        hasMoreData = false;
      } else {
        offset += limit; // Tambahkan offset untuk batch berikutnya
      }
    }

    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const executeInventory = async (req, res) => {
  const batchSize = 1000; // Sesuaikan batch size, misal 1000 per batch
  let offset = 0; // mulai dari baris
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      // Ambil data inventory dalam batch
      const inventories = await Inventory.findAll({
        attributes: [
          "id",
          "quantitySistem",
          "quantityActual",
          "quantityActualCheck",
          "remarks",
        ],
        include: [
          {
            model: AddressRack,
            attributes: ["id"],
            where: { flag: 1 },
            include: [
              {
                model: Storage,
                attributes: ["id"],
                where: { flag: 1 },
                include: [
                  {
                    model: Plant,
                    attributes: ["id"],
                    where: { flag: 1, id: req.params.plantId },
                  },
                ],
              },
            ],
          },
        ],
        limit: batchSize,
        offset: offset,
      });

      // Jika tidak ada data lagi, berhenti looping
      if (inventories.length === 0) {
        hasMoreData = false;
        break;
      }

      // Proses setiap record dalam batch
      for (const inventory of inventories) {
        let updatedQuantityActualCheck = null;

        if (inventory.quantitySistem !== null) {
          updatedQuantityActualCheck = inventory.quantitySistem;
        }
        if (inventory.quantityActual !== null) {
          updatedQuantityActualCheck = inventory.quantityActual;
        }

        // Update hanya jika ada perubahan dan quantityActual tidak null
        if (
          inventory.quantityActual !== null &&
          inventory.quantityActualCheck !== updatedQuantityActualCheck
        ) {
          await Inventory.update(
            { quantityActualCheck: updatedQuantityActualCheck },
            { where: { id: inventory.id } }
          );
        }
      }

      await Inventory.update(
        { quantityActual: null, remarks: null },
        { where: {} }
      );

      await LogEntry.create({
        typeLogEntry: "execute inventory",
        userId: req.user.userId,
      });

      // Increment offset untuk batch berikutnya
      offset += batchSize;
    }

    // Kirim respons sukses
    res.status(200).json({
      message: "Inventory updated successfully",
    });
  } catch (error) {
    console.error("Error updating inventory:", error);

    // Kirim respons error
    res.status(500).json({
      message: "Error updating inventory",
      error: error.message,
    });
  }
};

export const updateInventory = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const inventoryId = req.params.id;
    const { quantityActual, remarks } = req.body;

    // Validasi jika quantityActual kurang dari 0
    if (quantityActual < 0) {
      return res
        .status(400)
        .json({ message: "Quantity cannot be less than 0" });
    }

    // Update Inventory dengan quantityActual baru dan remarks dalam transaksi
    await Inventory.update(
      { quantityActual, remarks },
      {
        where: { id: inventoryId },
        transaction,
      }
    );

    const inventory = await Inventory.findOne({
      where: { id: inventoryId },
      transaction,
    });

    // Membuat log entry dalam transaksi
    await LogEntry.create(
      {
        inventoryId,
        typeLogEntry: "update inventory",
        quantity: quantityActual,
        userId: req.user.userId,
        detailOrder: null,
        incomingId: null,
      },
      { transaction }
    );

    // Update quantityActualCheck
    await setQuantityActualCheck(
      inventory.materialId,
      inventory.addressId,
      transaction
    );

    // Commit transaksi jika semua proses berhasil
    await transaction.commit();

    res.status(200).json({ message: "Inventory Updated" });
  } catch (error) {
    await transaction.rollback();
    console.log("Error updating inventory:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleUpdateIncoming = async (
  incomingIds,
  quantities,
  userId,
  transaction
) => {
  try {
    if (Array.isArray(incomingIds) && Array.isArray(quantities)) {
      if (incomingIds.length !== quantities.length) {
        throw new Error(
          "Incoming IDs and quantities array lengths do not match"
        );
      }

      // Ambil semua data incoming yang diperlukan dalam satu query
      const incomingData = await Incoming.findAll({
        where: { id: incomingIds },
        include: [
          {
            model: Inventory,
            attributes: ["id", "materialId", "addressId"],
          },
        ],
        transaction,
      });

      // hanya bisa update data incoming dalam hari ini
      const today = new Date();
      const incomingDate = new Date(incomingData[0].incomingDate);

      // Validasi hanya bisa update data incoming dalam hari ini
      if (incomingDate.getDate() !== today.getDate()) {
        throw new Error("Cannot update data for a different day");
      }

      // Buat mapping untuk proses bulk update
      const updates = [];
      const logEntries = [];
      const inventoryUpdates = new Set(); // Gunakan Set untuk menghindari duplikasi ID

      for (let i = 0; i < incomingIds.length; i++) {
        const incoming = incomingData.find(
          (item) => item.id === incomingIds[i]
        );
        if (!incoming) {
          throw new Error(`Incoming with ID ${incomingIds[i]} not found`);
        }

        const quantity = quantities[i];
        // if (quantity < 0) {
        //   throw new Error("Quantity not allowed under 0");
        // }

        // Tentukan status berdasarkan quantity
        const status = quantity < incoming.planning ? "partial" : "completed";

        // Siapkan data untuk update bulk
        updates.push({
          id: incomingIds[i],
          actual: quantity,
          status,
        });

        // Siapkan data untuk log entry
        logEntries.push({
          incomingId: incomingIds[i],
          typeLogEntry: "update incoming",
          quantity,
          userId,
          detailOrder: null,
        });

        // Tambahkan ID inventory ke Set
        inventoryUpdates.add(incoming.Inventory.id);
      }

      // Lakukan bulk insert untuk LogEntry
      await LogEntry.bulkCreate(logEntries, { transaction });

      // Lakukan update untuk Incoming secara manual, karena MSSQL tidak mendukung updateOnDuplicate
      for (const updateData of updates) {
        await Incoming.update(updateData, {
          where: { id: updateData.id },
          transaction,
        });
      }

      // Update sistem dan actual check untuk setiap inventory yang terpengaruh
      for (const inventoryId of inventoryUpdates) {
        await updateQuantitySistem(inventoryId, transaction);
      }

      const materialAddressPairs = [...inventoryUpdates].map((inventoryId) => {
        const inventory = incomingData.find(
          (item) => item.Inventory.id === inventoryId
        ).Inventory;
        return {
          materialId: inventory.materialId,
          addressId: inventory.addressId,
        };
      });

      for (const { materialId, addressId } of materialAddressPairs) {
        await setQuantityActualCheck(materialId, addressId, transaction);
      }
    } else {
      // Jika bukan array, proses sebagai data tunggal
      await processIncomingUpdate(incomingIds, quantities, userId, transaction);
    }
  } catch (error) {
    console.log("Error updating incoming:", error);
    throw error;
  }
};

const processIncomingUpdate = async (
  incomingId,
  quantity,
  userId,
  transaction
) => {
  const incoming = await Incoming.findOne({
    where: { id: incomingId },
    include: [
      {
        model: Inventory,
        attributes: ["id", "materialId", "addressId"],
      },
    ],
    transaction,
  });

  if (!incoming) {
    throw new Error(`Incoming with ID ${incomingId} not found`);
  }

  // if (quantity < 0) {
  //   throw new Error("Quantity not allowed under 0");
  // }

  const updateInventory = await updateQuantitySistem(
    incoming.Inventory.id,
    incoming.id,
    quantity,
    transaction
  );
  await setQuantityActualCheck(
    incoming.Inventory.materialId,
    incoming.Inventory.addressId,
    transaction
  );

  const status = quantity < incoming.planning ? "partial" : "completed";

  await Incoming.update(
    {
      actual: updateInventory,
      status,
    },
    {
      where: { id: incomingId },
      transaction,
    }
  );

  await LogEntry.create(
    {
      incomingId,
      typeLogEntry: "update incoming",
      quantity: updateInventory,
      userId,
      detailOrder: null,
    },
    { transaction }
  );
};

export const updateIncoming = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const incomingId = req.params.id;
    const quantity = req.body.actual;
    const userId = req.user.userId;

    await handleUpdateIncoming(incomingId, quantity, userId, transaction);

    // Commit transaksi jika semua proses berhasil
    await transaction.commit();

    res.status(200).json({ message: "Incoming Updated" });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log("Error updating incoming:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPlanIncoming = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { planning, inventoryId, incomingDate } = req.body;

    const inventory = await Inventory.findOne({
      where: { id: inventoryId },
    });

    // Validasi inventory
    if (!inventory) {
      return res.status(404).json({ message: "inventoryId not found" });
    }

    // Validasi untuk quantity plan tidak boleh kurang dari 0
    if (planning < 0) {
      return res.status(400).json({ message: "Quantity not allowed under 0" });
    }

    // Validasi untuk incomingDate tidak boleh kosong
    if (!incomingDate) {
      return res.status(400).json({ message: "Incoming date required" });
    }

    // Cek incoming jika sudah ada tidak bisa di update
    const existingIncoming = await Incoming.findOne({
      where: {
        inventoryId,
        incomingDate,
      },
      transaction,
    });

    if (existingIncoming) {
      return res.status(400).json({ message: "Incoming already exists" });
    }

    // Membuat entri Incoming dan menyimpan hasilnya
    const incoming = await Incoming.create(
      {
        planning,
        inventoryId,
        status: "not complete",
        logImportId: null,
        incomingDate,
      },
      { transaction }
    );

    // Ambil incomingId dari entri yang baru dibuat
    const incomingId = incoming.id;

    // Membuat log entry dalam transaksi
    await LogEntry.create(
      {
        incomingId,
        typeLogEntry: "create incoming",
        quantity: planning,
        userId: req.user.userId,
        detailOrder: null,
      },
      { transaction }
    );

    // Commit transaksi jika semua proses berhasil
    await transaction.commit();

    res.status(200).json({ message: "Incoming Updated" });
  } catch (error) {
    // Rollback transaksi jika terjadi error
    await transaction.rollback();
    console.log("Error updating incoming:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setQuantityActualCheck = async (
  materialId,
  addressId,
  transaction = null
) => {
  try {
    // Mengambil quantitySistem dan quantityActual dari Inventory
    const inventoryData = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantitySistem", "quantityActual"],
      transaction, // Tambahkan transaksi jika tersedia
    });

    // Pastikan inventoryData ditemukan
    if (!inventoryData) {
      throw new Error(
        `Inventory record not found for materialId: ${materialId} and addressId: ${addressId}`
      );
    }

    const { quantitySistem, quantityActual } = inventoryData;

    // Menentukan nilai quantityActualCheck
    let quantityActualCheck =
      quantityActual !== null
        ? quantityActual
        : quantitySistem !== null
        ? quantitySistem
        : 0;

    // Update nilai quantityActualCheck
    await Inventory.update(
      { quantityActualCheck },
      { where: { materialId, addressId }, transaction }
    );

    return quantityActualCheck;
  } catch (error) {
    console.error("Error setting quantityActualCheck:", error.message);
    throw new Error("Failed to set quantityActualCheck");
  }
};

const updateQuantitySistem = async (
  inventoryId,
  incomingId = null,
  quantity = null,
  transaction
) => {
  try {
    if (!inventoryId) {
      throw new Error("Invalid inventoryId");
    }

    let cumQuantity;

    if (incomingId !== null && quantity !== null) {
      const incoming = await Incoming.findOne({
        where: { id: incomingId },
        transaction,
      });

      const inventoryStock = await Inventory.findOne({
        where: { id: inventoryId },
        attributes: ["quantityActualCheck"],
        transaction,
      });

      const oldQuantity = incoming.actual;
      const newQuantity = quantity;
      console.log("oldQuantity", oldQuantity);
      console.log("newQuantity", newQuantity);
      const adjustment = newQuantity - oldQuantity;

      cumQuantity = inventoryStock.quantityActualCheck + adjustment;
      console.log("cumQuantity", cumQuantity);
    } else {
      // Hitung jumlah total kuantitas actual dari tabel Incoming berdasarkan inventoryId
      // const totalIncomingQuantity = await Incoming.sum("actual", {
      //   where: { inventoryId },
      //   transaction,
      // });

      // Last incoming quantity
      const lastIncoming = await Incoming.findOne({
        where: { inventoryId },
        attributes: ["actual"],
        order: [["createdAt", "DESC"]],
        transaction,
      });

      if (!lastIncoming) {
        throw new Error("Last incoming not found");
      }

      // Ambil nilai quantityActualCheck terbaru dari tabel Inventory berdasarkan inventoryId
      const inventoryStock = await Inventory.findOne({
        where: { id: inventoryId },
        attributes: ["quantityActualCheck"],
        transaction,
      });

      if (!inventoryStock) {
        throw new Error("Inventory stock not found");
      }

      cumQuantity = lastIncoming
        ? lastIncoming.actual + inventoryStock.quantityActualCheck
        : null;

      if (cumQuantity === null) {
        throw new Error(
          `Failed to calculate sum for inventoryId: ${inventoryId}`
        );
      }
    }

    // Perbarui nilai quantitySistem di tabel Inventory berdasarkan inventoryId
    await Inventory.update(
      { quantitySistem: cumQuantity },
      { where: { id: inventoryId }, transaction }
    );

    // Mengembalikan nilai yang dihitung untuk digunakan dalam fungsi pemanggil
    return cumQuantity;
  } catch (error) {
    console.error("Error updating quantitySistem:", error);
    throw error; // Lempar kembali error agar dapat ditangani di fungsi pemanggil
  }
};

export const updateStock = async (materialId, addressId, quantity, type) => {
  const transaction = await db.transaction();
  try {
    const inventory = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantityActualCheck", "id"],
      transaction,
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    // Update quantity sistem dan ambil quantityActualCheck yang terbaru
    const quantityActualCheck = await updateQuantitySistem(
      inventory.id,
      transaction
    );

    // Update berdasarkan tipe transaksi
    if (type === "incoming") {
      await Inventory.update(
        { quantitySistem: quantity + quantityActualCheck },
        { where: { materialId, addressId }, transaction }
      );
    } else if (type === "order") {
      await Inventory.update(
        { quantitySistem: quantityActualCheck - quantity },
        { where: { materialId, addressId }, transaction }
      );
    }

    // Set quantityActualCheck setelah update
    await setQuantityActualCheck(materialId, addressId, transaction);

    await transaction.commit();
  } catch (error) {
    console.error(`Failed to update stock: ${error.message}`);
    // Jangan throw error di sini, cukup log dan kembalikan status kesalahan jika perlu
    return false; // atau Anda bisa mengembalikan error untuk ditangani di level yang lebih tinggi
  }
};

export const getAllInventory = async (req, res) => {
  const limit = 1000; // Tentukan jumlah data per batch
  let offset = 0;
  let hasMoreData = true;
  let allData = []; // Variabel untuk menyimpan semua data

  try {
    while (hasMoreData) {
      // Mengambil data dalam batch
      const batchData = await Inventory.findAll({
        include: [
          {
            model: Material,
            attributes: [
              "id",
              "materialNo",
              "description",
              "uom",
              "minStock",
              "maxStock",
              "type",
            ],
            where: { flag: 1 },
          },
          {
            model: AddressRack,
            attributes: ["id", "addressRackName"],
            where: { flag: 1 },
            include: [
              {
                model: Storage,
                attributes: ["id", "storageName"],
                where: { flag: 1 },
                include: [
                  {
                    model: Plant,
                    attributes: ["id", "plantName"],
                    where: { flag: 1 },
                  },
                ],
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
                attributes: ["id", "username", "createdAt", "updatedAt"],
                where: { flag: 1 },
                required: false,
              },
            ],
          },
          {
            model: Incoming,
            limit: 1,
            order: [["createdAt", "DESC"]],
            where: {
              createdAt: {
                [Op.between]: [startOfToday, endOfToday],
              },
            },
          },
        ],
        limit,
        offset, // Mulai dari batch tertentu
      });

      // Tambahkan data batch ke allData
      allData = allData.concat(batchData);

      // Jika jumlah data yang diambil kurang dari limit, tidak ada lagi data yang tersisa
      if (batchData.length < limit) {
        hasMoreData = false;
      } else {
        offset += limit; // Tambahkan offset untuk batch berikutnya
      }
    }

    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const submitInventory = async (req, res) => {
  const items = req.body; // Menerima array items
  let transaction;

  try {
    // Pastikan transaksi dimulai
    transaction = await db.transaction();

    // Pastikan item.quantity diubah menjadi number
    items.forEach((item) => {
      item.quantity = Number(item.quantity); // Mengubah quantity menjadi number
      if (isNaN(item.quantity)) {
        throw new Error(`Invalid quantity for item ID ${item.id}`);
      }
    });

    // Ambil semua data Inventory yang diperlukan sekaligus untuk optimasi
    const inventories = await Inventory.findAll({
      where: { id: items.map((item) => item.id) },
      transaction,
    });

    // Update quantityActual untuk setiap item
    await Promise.all(
      items.map((item) =>
        Inventory.update(
          { quantityActual: item.quantity },
          { where: { id: item.id }, transaction }
        )
      )
    );

    // Buat log entries untuk setiap update
    const logEntries = items.map((item) => ({
      inventoryId: item.id,
      typeLogEntry: "update inventory",
      quantity: item.quantity,
      userId: req.user.userId,
      detailOrder: null,
      incomingId: null,
    }));
    await LogEntry.bulkCreate(logEntries, { transaction });

    // Update quantityActualCheck dengan Promise.all
    await Promise.all(
      inventories.map((inventory) =>
        setQuantityActualCheck(
          inventory.materialId,
          inventory.addressId,
          transaction
        )
      )
    );

    // Commit transaksi setelah semua operasi berhasil
    await transaction.commit();
    return res.status(200).json({ message: "Inventory updated successfully!" });
  } catch (error) {
    // Pastikan hanya rollback jika transaksi belum selesai
    console.error("Error occurred, rolling back:", error);

    if (transaction && transaction.finished !== "rollback") {
      console.log("Rolling back transaction");
      await transaction.rollback();
    }

    return res.status(500).json({ message: "Failed to update inventory" });
  }
};
