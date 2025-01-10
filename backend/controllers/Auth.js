import Users from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserWarehouse from "../models/UserWarehouseModel.js";

// Function to generate access and refresh tokens
const generateTokens = (
  userId,
  username,
  name,
  isProduction,
  isWarehouse,
  roleName,
  anotherWarehouseId,
  img
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

    const {
      id: userId,
      name,
      isProduction,
      isWarehouse,
      anotherWarehouseId,
      img,
    } = user;
    const roleName = user.Role.roleName;

    const { accessToken, refreshToken } = generateTokens(
      userId,
      username,
      name,
      isProduction,
      isWarehouse,
      roleName,
      anotherWarehouseId,
      img
    );

    await Users.update({ refreshToken }, { where: { id: userId, flag: 1 } });

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

  try {
    const user = await Users.findOne({ where: { refreshToken, flag: 1 } });
    if (!user) return res.sendStatus(204);

    await Users.update(
      { refreshToken: null },
      { where: { id: user.id, flag: 1 } }
    );

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Berhasil logout" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Refresh token function
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return res
      .status(401)
      .json({ message: "No token provided. Unauthorized access!" });

  try {
    const user = await Users.findOne({
      where: { refreshToken, flag: 1 },
      include: {
        model: Role,
        where: { flag: 1 },
      },
    });
    if (!user) return res.status(401).json({ message: "Unauthorized access!" });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err)
          return res
            .status(403)
            .json({ message: "Invalid or expired token. Access forbidden!" });

        const {
          id: userId,
          username,
          name,
          isProduction,
          isWarehouse,
          anotherWarehouseId,
          img,
        } = user;
        const roleName = user.Role.roleName;
        const { accessToken } = generateTokens(
          userId,
          username,
          name,
          isProduction,
          isWarehouse,
          roleName,
          anotherWarehouseId,
          img
        );

        res.json({ accessToken });
      }
    );
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
