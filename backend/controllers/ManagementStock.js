import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import LogEntry from "../models/LogEntryModel.js";
import User from "../models/UserModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import { Op } from "sequelize";

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0); // Mengatur waktu ke 00:00:00

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999); // Mengatur waktu ke 23:59:59

export const getInventory = async (req, res) => {
  const storageId = req.params.storageId;
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
            include: [
              {
                model: Storage,
                where: { flag: 1, id: storageId },
                include: [
                  {
                    model: Plant,
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

export const executeInventory = async (req, res) => {
  const batchSize = 1000; // Sesuaikan batch size, misal 1000 per batch
  let offset = 0; // mulai dari baris
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      // Ambil data inventory dalam batch
      const inventories = await Inventory.findAll({
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

        // Update hanya jika ada perubahan
        if (inventory.quantityActualCheck !== updatedQuantityActualCheck) {
          await Inventory.update({ quantityActualCheck: updatedQuantityActualCheck }, { where: { id: inventory.id } });
        }
      }

      await Inventory.update({ quantityActual: null, remarks: null }, { where: {} });

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
  try {
    const inventoryId = req.params.id;

    const { quantityActual, remarks } = req.body;

    if (req.body.quantityActual < 0) {
      return res.status(400).json({ message: "Quantity cannot be less than 0" });
    }

    await Inventory.update(
      { quantityActual, remarks },
      {
        where: {
          id: inventoryId,
        },
      }
    );

    const inventory = await Inventory.findOne({
      where: { id: inventoryId },
    });

    await LogEntry.create({
      inventoryId: inventoryId,
      typeLogEntry: "update inventory",
      quantity: req.body.quantityActual,
      userId: req.user.userId,
      detailOrder: null,
      incomingId: null,
    });

    setQuantityActualCheck(inventory.materialId, inventory.addressId);

    res.status(200).json({ message: "Inventory Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateIncoming = async (req, res) => {
  try {
    const incomingId = req.params.id;

    if (req.body.actual < 0) {
      return res.status(200).json({ message: "Quantity not allow under 0" });
    }

    await Incoming.update(req.body, {
      where: {
        id: incomingId,
      },
    });

    const incoming = await Incoming.findOne({
      where: { id: incomingId },
    });

    const inventory = await Inventory.findOne({
      where: { id: incoming.inventoryId },
    });

    await LogEntry.create({
      incomingId: incomingId,
      typeLogEntry: "update incoming",
      quantity: req.body.actual,
      userId: req.user.userId,
      detailOrder: null,
      incomingId: null,
    });

    await updateQuantitySistem(inventory.id);
    await setQuantityActualCheck(inventory.materialId, inventory.addressId);

    res.status(200).json({ message: "Incoming Updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setQuantityActualCheck = async (materialId, addressId) => {
  try {
    // Mengambil nilai quantitySistem dari Inventory
    const inventoryData = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantitySistem", "quantityActual"],
    });

    // Pastikan inventoryData ditemukan
    if (!inventoryData) {
      throw new Error(`Inventory record not found for materialId: ${materialId} and addressId: ${addressId}`);
    }

    const { quantitySistem, quantityActual } = inventoryData;

    let quantityActualCheck;

    if (quantityActual == null && quantitySistem != null) {
      quantityActualCheck = quantitySistem;
    } else if (quantityActual != null) {
      quantityActualCheck = quantityActual;
    } else if (quantitySistem == null && quantityActual == null) {
      quantityActualCheck = 0; // Menggunakan nilai default 0 jika kedua nilai null
    } else {
      quantityActualCheck = 0;
    }

    await Inventory.update({ quantityActualCheck }, { where: { materialId, addressId } });

    return quantityActualCheck;
  } catch (error) {
    console.error("Error setting quantityActualCheck:", error.message);
    return null;
  }
};

const updateQuantitySistem = async (inventoryId) => {
  try {
    // Pastikan inventoryId adalah nilai yang valid
    if (!inventoryId) {
      throw new Error("Invalid inventoryId");
    }

    // Hitung jumlah total kuantitas actual dari tabel Incoming berdasarkan inventoryId
    const totalIncomingQuantity = await Incoming.sum("actual", {
      where: {
        inventoryId: inventoryId,
      },
    });

    // Pastikan nilai totalIncomingQuantity berhasil dihitung
    if (totalIncomingQuantity === null) {
      throw new Error(`Failed to calculate sum for inventoryId: ${inventoryId}`);
    }

    // Perbarui nilai quantitySistem di tabel Inventory berdasarkan inventoryId
    const [affectedRows] = await Inventory.update({ quantitySistem: totalIncomingQuantity }, { where: { id: inventoryId } });

    // Log jika tidak ada baris yang diupdate
    if (affectedRows === 0) {
      console.log(`No inventory records updated for inventoryId: ${inventoryId}`);
    } else {
      console.log(`Updated quantitySistem for inventoryId: ${inventoryId} to ${totalIncomingQuantity}`);
    }
  } catch (error) {
    console.error("Error updating quantitySistem:", error.message);
  }
};

export const updateStock = async (materialId, addressId, quantity, type) => {
  try {
    let quantityActualCheck = null;

    const inventory = await Inventory.findOne({
      where: { materialId, addressId },
      attributes: ["quantityActualCheck", "id"],
    });

    quantityActualCheck = inventory.quantityActualCheck;

    await updateQuantitySistem(inventory.id);

    if (quantityActualCheck == null) {
      quantityActualCheck = setQuantityActualCheck(materialId, addressId);
    }

    if (type === "incoming") {
      await Inventory.update({ quantitySistem: quantity + quantityActualCheck }, { where: { materialId, addressId } });
    } else if (type === "order") {
      await Inventory.update({ quantitySistem: quantityActualCheck - quantity }, { where: { materialId, addressId } });
    }

    setQuantityActualCheck(materialId, addressId);

    return;
  } catch (error) {
    console.log(error.message);
    return;
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
            include: [
              {
                model: Storage,
                where: { flag: 1 },
                include: [
                  {
                    model: Plant,
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

  try {
    const inventories = await Promise.all(
      items.map((item) =>
        Inventory.findOne({
          where: { id: item.id },
        })
      )
    );

    const updatePromises = items.map((item) => Inventory.update({ quantityActual: item.quantity }, { where: { id: item.id } }));

    await Promise.all(updatePromises);

    // Menggunakan for...of dengan await jika setQuantityActualCheck adalah async
    for (const inventory of inventories) {
      if (inventory) {
        await setQuantityActualCheck(inventory.materialId, inventory.addressId);
      }
    }

    return res.status(200).json({ message: "Inventory updated successfully!" });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return res.status(500).json({ message: "Failed to update inventory" });
  }
};
