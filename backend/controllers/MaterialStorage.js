import MaterialStorage from "../models/MaterialStorageModel.js";
import User from "../models/UserModel.js";
import Warehouse from "../models/WarehouseModel.js";
import LogMaster from "../models/LogMasterModel.js";
import Material from "../models/MaterialModel.js";
import Storage from "../models/StorageModel.js";

export const getMaterialStorage = async (req, res) => {
  try {
    const response = await MaterialStorage.findAll({
      where: { flag: 1 },
      include: [
        {
          model: Material,
          required: true,
          attributes: ["id", "materialNo", "description", "uom"],
        },
        {
          model: Storage,
          required: true,
          attributes: ["id", "storageName"],
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy", // Alias sesuai dengan hook "afterCreate"
          attributes: ["id", "createdAt", "userId"],
          where: {
            masterType: "MaterialStorage",
            action: "create",
            [Op.and]: [
              {
                masterId: Sequelize.literal(
                  `CONCAT(materialId, '-', storageId)`
                ),
              }, // Kombinasikan materialId dan storageId untuk masterId
            ],
          },
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
          as: "updatedBy", // Alias sesuai dengan hook "afterUpdate"
          attributes: ["id", "createdAt", "userId"],
          where: {
            masterType: "MaterialStorage",
            [Op.and]: [
              {
                masterId: Sequelize.literal(`CONCAT(userId, '-', warehouseId)`),
              }, // Kombinasikan userId dan warehouseId untuk masterId
            ],
          },
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
      ],
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMaterialStorage = async (req, res) => {
  try {
    const { materialId, storageId } = req.body;
    const material = await Material.findOne({
      where: { id: materialId, flag: 1 },
    });
    const storage = await Storage.findOne({
      where: { id: storageId, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (!storage) {
      return res.status(404).json({ message: "Storage not found" });
    }

    const existingMaterialStorage = await MaterialStorage.findOne({
      where: { materialId: materialId, storageId: storageId, flag: 1 },
    });

    if (existingMaterialStorage) {
      return res
        .status(400)
        .json({ message: "MaterialStorage already exists" });
    }

    await MaterialStorage.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "MaterialStorage Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMaterialStorage = async (req, res) => {
  try {
    const { id } = req.params.id; // Mengambil id dari parameter URL
    const { storageIds } = req.body; // Mendapatkan storageIds dari request body

    // Cek apakah Material dengan id tersebut ada
    const material = await Material.findOne({
      where: { id: id, flag: 1 },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Cari Storage yang sesuai dengan storageIds dari request body
    const storage = await Storage.findAll({
      where: { id: storageIds, flag: 1 }, // Mendapatkan role berdasarkan id
    });

    if (!storage || storage.length === 0) {
      return res.status(404).json({ message: "Warehouses not found" });
    }

    // Update relasi many-to-many antara Material dan Storage melalui tabel MaterialStorage
    await material.setStorages(storage); // Mengganti semua relasi existing dengan Storage baru

    res.status(200).json({ message: "Material storage updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMaterialStorage = async (req, res) => {
  try {
    const { materialId, storageId } = req.params; // Mengambil materialId dan storageId dari parameter URL

    // Cek apakah relasi antara User dan Warehouse dengan flag 1 (aktif) ada
    const materialStorage = await MaterialStorage.findOne({
      where: { materialId: materialId, storageId: storageId, flag: 1 }, // Hanya mencari relasi aktif (flag = 1)
    });

    if (!materialStorage) {
      return res.status(404).json({
        message: "MaterialStorage relation not found or already deleted",
      });
    }

    // Update flag menjadi 0 (soft delete)
    await MaterialStorage.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      {
        where: { materialId: materialId, storageId: storageId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      } // Hanya mengupdate relasi yang aktif (flag = 1)
    );

    res.status(200).json({ message: "MaterialStorage relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
