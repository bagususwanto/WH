import Inventory from "../models/InventoryModel.js";
import Material from "../models/MaterialModel.js";
import Category from "../models/CategoryModel.js";
import Supplier from "../models/SupplierModel.js";
import Incoming from "../models/IncomingModel.js";
import LogEntry from "../models/LogEntryModel.js";
import User from "../models/UserModel.js";
import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Shop from "../models/ShopModel.js";
import Plant from "../models/PlantModel.js";
import { Op } from "sequelize";

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0); // Mengatur waktu ke 00:00:00

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999); // Mengatur waktu ke 23:59:59

export const getInventory = async (req, res) => {
  try {
    const response = await Inventory.findAll({
      attributes: ["id", "quantitySistem", "quantityActual", "quantityActualCheck", "remarks", "createdAt", "updatedAt"],
      include: [
        {
          model: Material,
          attributes: ["id", "materialNo", "description", "uom", "price", "type", "minStock", "maxStock", "img", "createdAt", "updatedAt"],
          include: [
            {
              model: Category,
              attributes: ["id", "categoryName", "createdAt", "updatedAt"],
            },
            {
              model: Supplier,
              attributes: ["id", "supplierName", "createdAt", "updatedAt"],
            },
          ],
        },
        {
          model: AddressRack,
          attributes: ["id", "addressRackName", "createdAt", "updatedAt"],
          include: [
            {
              model: Storage,
              attributes: ["id", "storageName", "createdAt", "updatedAt"],
              include: [
                {
                  model: Shop,
                  attributes: ["id", "shopName", "createdAt", "updatedAt"],
                  include: [
                    {
                      model: Plant,
                      attributes: ["id", "plantCode", "plantName", "createdAt", "updatedAt"],
                    },
                  ],
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
          include: [
            {
              model: User,
              attributes: ["id", "userName", "createdAt", "updatedAt"],
            },
          ],
        },
        {
          model: Incoming,
          attributes: ["id", "planning", "actual", "createdAt", "updatedAt"],
          limit: 1,
          order: [["createdAt", "DESC"]],
          where: {
            createdAt: {
              [Op.between]: [startOfToday, endOfToday],
            },
          },
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;

    if (req.body.quantityActual < 0) {
      return res.status(200).json({ message: "Quantity not allow under 0" });
    }

    await Inventory.update(req.body, {
      where: {
        id: inventoryId,
      },
    });

    const inventory = await Inventory.findOne({
      where: { id: inventoryId },
    });

    await LogEntry.create({
      inventoryId: inventoryId,
      typeLogEntry: "update inventory",
      quantity: req.body.quantityActual,
      materialId: inventory.materialId,
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
      materialId: inventory.materialId,
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
    console.log(inventoryId);
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
