import jwt from "jsonwebtoken";
import Users from "../models/UserModel.js";
import UserWarehouse from "../models/UserWarehouseModel.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization; // Akses header langsung
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Unauthorized access!" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired token. Access forbidden!" });
    }

    // Panggil fungsi asinkron untuk mendapatkan data organisasi
    const user = await getOrganizationByUserId(decoded.userId);
    const warehouseIds = await getWarehouseIdsByUserId(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Tambahkan informasi yang sudah didekodekan ke objek request
    req.user = {
      username: decoded.username,
      userId: decoded.userId,
      roleName: decoded.roleName,
      groupId: user.groupId,
      lineId: user.lineId,
      sectionId: user.sectionId,
      departmentId: user.departmentId,
      divisionId: user.divisionId,
      organizationId: user.organizationId,
      warehouseId: user.warehouseId,
      warehouseIds: warehouseIds,
      isProduction: decoded.isProduction,
      isWarehouse: decoded.isWarehouse,
      anotherWarehouseId: decoded.anotherWarehouseId,
    };

    next();
  });
};

const getOrganizationByUserId = async (userId) => {
  const user = await Users.findOne({
    where: { id: userId, flag: 1 },
  });
  return user;
};

const getWarehouseIdsByUserId = async (userId) => {
  const user = await UserWarehouse.findAll({
    where: { userId: userId, flag: 1 },
  });
  return user.map((user) => user.warehouseId);
};
