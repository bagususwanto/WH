import UserWarehouse from "../models/UserWarehouseModel.js";

export const checkUserWarehouse = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Ambil userId dari req.user
    const warehouseId = req.query.params; // Ambil warehouseId dari params

    if (!warehouseId) {
      return res.status(400).json({ message: "warehouseId is required" });
    }

    // Cari userWarehouse berdasarkan userId dan warehouseId
    const userWarehouse = await UserWarehouse.findOne({
      where: {
        userId,
        warehouseId,
      },
    });

    // Jika user memiliki akses ke warehouse
    if (userWarehouse) {
      return next(); // Lanjutkan ke middleware berikutnya
    } else {
      return res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
