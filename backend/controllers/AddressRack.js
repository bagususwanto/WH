import AddressRack from "../models/AddressRackModel.js";
import Storage from "../models/StorageModel.js";
import Plant from "../models/PlantModel.js";
import Warehouse from "../models/WarehouseModel.js";
import User from "../models/UserModel.js";
import LogMaster from "../models/LogMasterModel.js";
import LogImport from "../models/LogImportModel.js";
import db from "../utils/Database.js";

export const getAddressRack = async (req, res) => {
  try {
    let response = [];
    let offset = 0;
    const limit = 1000;
    let batch;
    const { storageId, plantId } = req.query;

    let whereConditionStorage = { flag: 1 };
    let whereConditionPlant = { flag: 1 };

    if (storageId) {
      whereConditionStorage.id = storageId;
    }

    if (plantId) {
      whereConditionPlant.id = plantId;
    }

    do {
      // Fetch a batch of 1000 records
      batch = await AddressRack.findAll({
        limit,
        offset,
        where: { flag: 1 },
        subQuery: false,
        include: [
          {
            model: Storage,
            where: whereConditionStorage,
            required: true,
            include: [
              {
                model: Plant,
                where: whereConditionPlant,
                required: true,
              },
            ],
          },
          {
            model: LogMaster,
            required: false,
            as: "createdBy",
            attributes: ["id", "createdAt", "userId"],
            where: { masterType: "AddressRack", action: "create" },
            include: [
              {
                model: User,
                required: false,
                attributes: ["id", "username"],
              },
            ],
          },
          {
            model: LogMaster,
            required: false,
            as: "updatedBy",
            attributes: ["id", "createdAt", "userId"],
            where: { masterType: "AddressRack" },
            include: [
              {
                model: User,
                required: false,
                attributes: ["id", "username"],
              },
            ],
            order: [["createdAt", "DESC"]],
            limit: 1,
          },
          {
            model: LogImport,
            attributes: ["id", "createdAt", "userId"],
            required: false,
            include: [
              {
                model: User,
                required: false,
                attributes: ["id", "username"],
              },
            ],
          },
        ],
      });

      // Add the batch to the response array
      response = response.concat(batch);

      // Update offset for the next batch
      offset += limit;
    } while (batch.length === limit); // Continue fetching until we get less than 1000 records

    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Address Racks not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAddressRackById = async (req, res) => {
  try {
    const addressRackId = req.params.id;
    const userId = req.user.userId;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId, flag: 1 },
    });

    if (!addressRack) {
      return res.status(404).json({ message: "AddressRack not found" });
    }

    const response = await AddressRack.findOne({
      where: {
        id: addressRackId,
        flag: 1,
      },
      include: [
        {
          model: Storage,
          where: { flag: 1 },
          include: [
            {
              model: Plant,
              where: { flag: 1 },
              include: [
                {
                  model: Warehouse,
                  where: { flag: 1 },
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createAddressRack = async (req, res) => {
  const transaction = await db.transaction();
  try {
    // Body
    const { addressRackName, storageId, plantId } = req.body;

    // Validasi data tersedia
    if (!addressRackName || !storageId || !plantId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Cek storage
    const storage = await Storage.findOne({
      where: { id: storageId.id, flag: 1 },
      transaction,
    });
    if (!storage) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Storage not found",
      });
    }

    // cek plant
    const plant = await Plant.findOne({
      where: { id: plantId.id, flag: 1 },
      transaction,
    });
    if (!plant) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Plant not found",
      });
    }

    // Validasi exist address
    const existAddress = await AddressRack.findOne({
      where: {
        addressRackName,
        storageId: storageId.id,
        flag: 1,
      },
      transaction,
    });
    if (existAddress) {
      await transaction.rollback();
      return res.status(400).json({
        message: "AddressRack already exist",
      });
    }

    let idStorage;
    // cek storage plant
    const storagePlant = await Storage.findOne({
      where: {
        id: storageId.id,
        plantId: plantId.id,
        flag: 1,
      },
      transaction,
    });
    if (!storagePlant) {
      idStorage = await Storage.create(
        {
          id: storageId.id,
          plantId: plantId.id,
        },
        { transaction, userId: req.user.userId }
      );
    } else {
      idStorage = storagePlant;
    }

    await AddressRack.create(
      {
        addressRackName,
        storageId: idStorage.id,
      },
      { transaction, userId: req.user.userId }
    );

    await transaction.commit();
    res.status(201).json({ message: "AddressRack Created" });
  } catch (error) {
    await transaction.rollback();
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAddressRack = async (req, res) => {
  const transaction = await db.transaction();
  try {
    // Params dan Body
    const { id } = req.params;
    const { addressRackName, storageId, plantId } = req.body;

    // Validasi data tersedia
    if (!id || !addressRackName || !storageId || !plantId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Cek AddressRack
    const addressRack = await AddressRack.findOne({
      where: { id, flag: 1 },
      transaction,
    });
    if (!addressRack) {
      await transaction.rollback();
      return res.status(404).json({
        message: "AddressRack not found",
      });
    }

    // Cek storage
    const storage = await Storage.findOne({
      where: { id: storageId.id, flag: 1 },
      transaction,
    });
    if (!storage) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Storage not found",
      });
    }

    // Cek plant
    const plant = await Plant.findOne({
      where: { id: plantId.id, flag: 1 },
      transaction,
    });
    if (!plant) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Plant not found",
      });
    }

    let idStorage;
    // cek storage plant
    const storagePlant = await Storage.findOne({
      where: {
        id: storageId.id,
        plantId: plantId.id,
        flag: 1,
      },
      transaction,
    });
    if (!storagePlant) {
      idStorage = await Storage.create(
        {
          id: storageId.id,
          plantId: plantId.id,
        },
        { transaction, userId: req.user.userId }
      );
    } else {
      idStorage = storagePlant;
    }

    // Validasi exist address (cek jika nama baru sudah ada di storage yang sama)
    const existAddress = await AddressRack.findOne({
      where: {
        addressRackName,
        storageId: storageId.id,
        flag: 1,
      },
      transaction,
    });
    if (existAddress && storagePlant) {
      await transaction.rollback();
      return res.status(400).json({
        message: "AddressRack with this name already exists",
      });
    }

    // Perbarui data AddressRack
    await addressRack.update(
      {
        storageId: idStorage.id,
      },
      { transaction, userId: req.user.userId }
    );

    await transaction.commit();
    res.status(200).json({ message: "AddressRack updated successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAddressRack = async (req, res) => {
  try {
    const addressRackId = req.params.id;

    const addressRack = await AddressRack.findOne({
      where: { id: addressRackId, flag: 1 },
    });

    if (!addressRack) {
      return res.status(404).json({ message: "AddressRack not found" });
    }

    await AddressRack.update(
      { flag: 0 },
      {
        where: { id: addressRackId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      }
    );

    res.status(200).json({ message: "AddressRack deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
