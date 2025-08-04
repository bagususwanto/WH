import Users from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserWarehouse from "../models/UserWarehouseModel.js";
import { PASSWORD_EXPIRATION_DAYS } from "../middleware/CheckPasswordExpiration.js";
import Organization from "../models/OrganizationModel.js";
import RefreshToken from "../models/RefreshTokenModel.js";
import User from "../models/UserModel.js";

// Function to generate access and refresh tokens
const generateTokens = (
  userId,
  username,
  name,
  isProduction,
  isWarehouse,
  roleName,
  anotherWarehouseId,
  img,
  plantId
) => {
  const accessToken = jwt.sign(
    {
      userId,
      username,
      name,
      isProduction,
      isWarehouse,
      roleName,
      anotherWarehouseId,
      img,
      plantId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    {
      userId,
      username,
      name,
      isProduction,
      isWarehouse,
      roleName,
      anotherWarehouseId,
      img,
      plantId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "12h",
    }
  );

  return { accessToken, refreshToken };
};

// Login function
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password harus diisi" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password harus lebih dari 6 karakter" });
  }

  try {
    const user = await Users.findOne({
      where: { username, flag: 1 },
      include: [
        {
          model: Role,
          where: { flag: 1 },
        },
        {
          model: Organization,
          where: { flag: 1 },
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Username atau password tidak sesuai" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Username atau password tidak sesuai" });
    }

    // **Cek Password Expired Sebelum Mengembalikan Token**
    // const now = new Date();
    // const lastUpdated = user.passwordUpdatedAt
    //   ? new Date(user.passwordUpdatedAt)
    //   : null;
    // const diffDays = lastUpdated
    //   ? Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24))
    //   : PASSWORD_EXPIRATION_DAYS + 1;

    // if (diffDays > PASSWORD_EXPIRATION_DAYS) {
    //   return res.status(403).json({
    //     message: "Password has expired. Please reset it.",
    //   });
    // }

    const {
      id: userId,
      name,
      isProduction,
      isWarehouse,
      anotherWarehouseId,
      img,
    } = user;
    const roleName = user.Role.roleName;
    const plantId = user.Organization.plantId;

    const { accessToken, refreshToken } = generateTokens(
      userId,
      username,
      name,
      isProduction,
      isWarehouse,
      roleName,
      anotherWarehouseId,
      img,
      plantId
    );

    // await Users.update({ refreshToken }, { where: { id: userId, flag: 1 } });

    // Save the refresh token to the database
    await RefreshToken.create({
      token: refreshToken,
      userId,
      expiredAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: "None",
      maxAge: 12 * 60 * 60 * 1000, // 12 jam
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Logout function
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const tokenData = await RefreshToken.findOne({
    where: { token: refreshToken },
  });
  if (!tokenData) return res.sendStatus(204);

  try {
    res.clearCookie("refreshToken");
    await RefreshToken.destroy({ where: { userId: tokenData.userId } });
    res.status(200).json({ message: "Berhasil logout" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Refresh token function
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log("Received refresh token:", refreshToken);

  if (!refreshToken) {
    return res.status(401).json({
      message: "No token provided. Unauthorized access!",
    });
  }

  try {
    const tokenData = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [
        {
          model: User,
          required: true,
          include: [
            { model: Role, required: true },
            { model: Organization, required: true },
          ],
        },
      ],
    });

    if (!tokenData) {
      console.log("❌ Token not found");
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (tokenData.expiredAt < new Date()) {
      console.log("❌ Token expired");
      return res.status(403).json({ message: "Expired token" });
    }

    // verify token jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err) {
        console.error("❌ Invalid refresh token:", err);
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    });

    const {
      id: userId,
      username,
      name,
      isProduction,
      isWarehouse,
      anotherWarehouseId,
      img,
    } = tokenData.User;
    const roleName = tokenData.User.Role.roleName;
    const plantId = tokenData.User.Organization.plantId;

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      userId,
      username,
      name,
      isProduction,
      isWarehouse,
      roleName,
      anotherWarehouseId,
      img,
      plantId
    );

    // Gunakan transaksi agar update & insert atomik
    const transaction = await RefreshToken.sequelize.transaction();
    try {
      // Simpan token baru
      await RefreshToken.create(
        {
          token: newRefreshToken,
          userId,
          expiredAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        },
        { transaction }
      );

      await RefreshToken.destroy({
        where: { token: refreshToken },
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    // Set new cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: "None",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const checkValidasiUserWH = async (req, res) => {
  try {
    const userId = req.user.userId; // Ambil userId dari req.user
    const warehouseId = req.params.warehouseId; // Ambil warehouseId dari params

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
    if (!userWarehouse) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have the required permissions for this plant",
      });
    }

    // Tambahkan respons untuk validasi berhasil
    return res.status(200).json({ message: "Validation successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyTokenAccess = async (req, res) => {
  const authHeader = req.headers.authorization;
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

    // helper functions to get organization and warehouse IDs
    const getOrganizationByUserId = async (userId) => {
      const user = await Users.findOne({
        where: { id: userId },
        include: [
          {
            model: Organization,
            required: true,
          },
        ],
      });
      return user;
    };

    // helper functions to get organization and warehouse IDs
    const getWarehouseIdsByUserId = async (userId) => {
      const user = await UserWarehouse.findAll({
        where: { userId: userId, flag: 1 },
      });
      return user.map((user) => user.warehouseId);
    };

    const user = await getOrganizationByUserId(decoded.userId);
    const warehouseIds = await getWarehouseIdsByUserId(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Balikin user info
    res.json({
      username: decoded.username,
      userId: decoded.userId,
      roleName: decoded.roleName,
      groupId: user.Organization.groupId,
      lineId: user.Organization.lineId,
      sectionId: user.Organization.sectionId,
      departmentId: user.Organization.departmentId,
      divisionId: user.Organization.divisionId,
      organizationId: user.organizationId,
      warehouseId: user.warehouseId,
      warehouseIds: warehouseIds,
      isProduction: decoded.isProduction,
      isWarehouse: decoded.isWarehouse,
      anotherWarehouseId: decoded.anotherWarehouseId,
    });
  });
};
