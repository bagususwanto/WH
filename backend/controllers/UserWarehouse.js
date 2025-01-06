import UserWarehouse from "../models/UserWarehouseModel.js";
import User from "../models/UserModel.js";
import Warehouse from "../models/WarehouseModel.js";
import LogMaster from "../models/LogMasterModel.js";

export const getUserWarehouse = async (req, res) => {
  try {
    const response = await UserWarehouse.findAll({
      where: { flag: 1 },
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "username"],
        },
        {
          model: Warehouse,
          required: true,
          attributes: ["id", "warehouseName"],
        },
        {
          model: LogMaster,
          required: false,
          as: "createdBy", // Alias sesuai dengan hook "afterCreate"
          attributes: ["id", "createdAt", "userId"],
          where: {
            masterType: "UserWarehouse",
            action: "create",
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
        },
        {
          model: LogMaster,
          required: false,
          as: "updatedBy", // Alias sesuai dengan hook "afterUpdate"
          attributes: ["id", "createdAt", "userId"],
          where: {
            masterType: "UserWarehouse",
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

export const getUserWarehouseByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userWarehouse = await UserWarehouse.findOne({
      where: { userId: userId, flag: 1 },
    });

    if (!userWarehouse) {
      return res.status(404).json({ message: "UserWarehouse not found" });
    }

    const response = await UserWarehouse.findAll({
      where: {
        userId: userId,
        flag: 1,
      },
      include: [
        {
          model: Warehouse, // Menyertakan model Warehouse
          required: true, // Menentukan bahwa Warehouse harus ada
        },
      ],
      // order: [["createdAt", "DESC"]],
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUserWarehouse = async (req, res) => {
  try {
    const { userId, warehouseId } = req.body;
    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });
    const warehouse = await Warehouse.findOne({
      where: { id: warehouseId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const existingUserWarehouse = await UserWarehouse.findOne({
      where: { userId: userId, warehouseId: warehouseId, flag: 1 },
    });

    if (existingUserWarehouse) {
      return res.status(400).json({ message: "UserWarehouse already exists" });
    }

    await UserWarehouse.create(req.body, { userId: req.user.userId });
    res.status(201).json({ message: "UserWarehouse Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserWarehouse = async (req, res) => {
  try {
    const { id } = req.params.id; // Mengambil id dari parameter URL
    const { warehouseIds } = req.body; // Mendapatkan warehouseIds dari request body

    // Cek apakah User dengan id tersebut ada
    const user = await User.findOne({
      where: { id: id, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cari Warehouse yang sesuai dengan warehouseIds dari request body
    const warehouse = await Warehouse.findAll({
      where: { id: warehouseIds, flag: 1 }, // Mendapatkan role berdasarkan id
    });

    if (!warehouse || warehouse.length === 0) {
      return res.status(404).json({ message: "Warehouses not found" });
    }

    // Update relasi many-to-many antara User dan Warehouse melalui tabel UserWarehouse
    await user.setWarehouses(warehouse); // Mengganti semua relasi existing dengan Warehouse baru

    res.status(200).json({ message: "User warehouse updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserWarehouse = async (req, res) => {
  try {
    const { userId, warehouseId } = req.params; // Mengambil userId dan warehouseId dari parameter URL

    // Cek apakah relasi antara User dan Warehouse dengan flag 1 (aktif) ada
    const userWarehouse = await UserWarehouse.findOne({
      where: { userId: userId, warehouseId: warehouseId, flag: 1 }, // Hanya mencari relasi aktif (flag = 1)
    });

    if (!userWarehouse) {
      return res.status(404).json({
        message: "UserWarehouse relation not found or already deleted",
      });
    }

    // Update flag menjadi 0 (soft delete)
    await UserWarehouse.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      {
        where: { userId: userId, warehouseId: warehouseId, flag: 1 },
        individualHooks: true,
        userId: req.user.userId,
      } // Hanya mengupdate relasi yang aktif (flag = 1)
    );

    res.status(200).json({ message: "UserWarehouse relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
