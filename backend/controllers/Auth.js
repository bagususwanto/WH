import Users from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Function to generate access and refresh tokens
const generateTokens = (userId, username, name, isProduction, roleName) => {
  const accessToken = jwt.sign({ userId, username, name, isProduction, roleName }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId, username, name, isProduction, roleName }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  return { accessToken, refreshToken };
};

// Login function
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password harus diisi" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password harus lebih dari 6 karakter" });
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
      return res.status(404).json({ message: "Username atau password tidak sesuai" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Username atau password tidak sesuai" });
    }

    const { id: userId, name, isProduction } = user;
    const roleName = user.Role.roleName;

    const { accessToken, refreshToken } = generateTokens(userId, username, name, isProduction, roleName);

    await Users.update({ refreshToken }, { where: { id: userId, flag: 1 } });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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

    await Users.update({ refreshToken: null }, { where: { id: user.id, flag: 1 } });

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

  if (!refreshToken) return res.status(401).json({ message: "No token provided. Unauthorized access!" });

  try {
    const user = await Users.findOne({
      where: { refreshToken, flag: 1 },
      include: {
        model: Role,
        where: { flag: 1 },
      },
    });
    if (!user) return res.status(401).json({ message: "Unauthorized access!" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token. Access forbidden!" });

      const { id: userId, username, name, isProduction } = user;
      const roleName = user.Role.roleName;
      const { accessToken } = generateTokens(userId, username, name, isProduction, roleName);

      res.json({ accessToken });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
