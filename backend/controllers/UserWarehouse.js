import UserWarehouse from "../models/UserWarehouseModel.js";
import User from "../models/UserModel.js";
import Warehouse from "../models/WarehouseModel.js";

export const getUserWarehouse = async (req, res) => {
  try {
    const response = await UserWarehouse.findAll({
      where: { flag: 1 },
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserWarehouseByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

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
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUserWarehouse = async (req, res) => {
  try {
    const { userId, plantId } = req.body;
    const user = await User.findOne({
      where: { id: userId, flag: 1 },
    });
    const plant = await Warehouse.findOne({
      where: { id: plantId, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!plant) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const existingUserWarehouse = await UserWarehouse.findOne({
      where: { userId: userId, plantId: plantId, flag: 1 },
    });

    if (existingUserWarehouse) {
      return res.status(400).json({ message: "UserWarehouse already exists" });
    }

    await UserWarehouse.create(req.body);
    res.status(201).json({ message: "UserWarehouse Created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserWarehouse = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil id dari parameter URL
    const { plantIds } = req.body; // Mendapatkan plantIds dari request body

    // Cek apakah User dengan id tersebut ada
    const user = await User.findOne({
      where: { id: id, flag: 1 },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cari Warehouse yang sesuai dengan plantIds dari request body
    const plant = await Warehouse.findAll({
      where: { id: plantIds, flag: 1 }, // Mendapatkan role berdasarkan id
    });

    if (!plant || plant.length === 0) {
      return res.status(404).json({ message: "Warehouses not found" });
    }

    // Update relasi many-to-many antara User dan Warehouse melalui tabel UserWarehouse
    await user.setWarehouses(plant); // Mengganti semua relasi existing dengan Warehouse baru

    res.status(200).json({ message: "User plant updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserWarehouse = async (req, res) => {
  try {
    const { userId, plantId } = req.params; // Mengambil userId dan plantId dari parameter URL

    // Cek apakah relasi antara User dan Warehouse dengan flag 1 (aktif) ada
    const userWarehouse = await UserWarehouse.findOne({
      where: { userId: userId, plantId: plantId, flag: 1 }, // Hanya mencari relasi aktif (flag = 1)
    });

    if (!userWarehouse) {
      return res.status(404).json({ message: "UserWarehouse relation not found or already deleted" });
    }

    // Update flag menjadi 0 (soft delete)
    await UserWarehouse.update(
      { flag: 0 }, // Mengubah flag menjadi 0 (menandai sebagai "dihapus")
      { where: { userId: userId, plantId: plantId, flag: 1 } }
    );

    res.status(200).json({ message: "UserWarehouse relation deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
