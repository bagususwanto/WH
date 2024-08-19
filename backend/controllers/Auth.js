import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateTokens = (userId, username, name, roleId) => {
  const accessToken = jwt.sign({ userId, username, name, roleId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });

  const refreshToken = jwt.sign({ userId, username, name, roleId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });

  return { accessToken, refreshToken };
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Validasi input agar tidak kosong
    if (!username || !password) {
      return res.status(400).json({ msg: "Username dan password harus diisi" });
    }

    const user = await Users.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ msg: "Username atau password tidak sesuai" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ msg: "Username atau password tidak sesuai" });
    }

    const { id: userId, name, roleId } = user;
    const { accessToken, refreshToken } = generateTokens(userId, username, name, roleId);

    await Users.update({ refreshToken }, { where: { id: userId } });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // maxAge: 1 * 60 * 1000, // 1 menit
    });

    return res.json({ accessToken });
  } catch (error) {
    console.error(error); // Logging error untuk debugging
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(400).json({ msg: "Token tidak ada" });

  try {
    const user = await Users.findOne({ where: { refreshToken } });
    if (!user) return res.status(400).json({ msg: "User tidak ditemukan" });

    await Users.update({ refreshToken: null }, { where: { id: user.id } });

    res.clearCookie("refreshToken");
    return res.status(200).json({ msg: "Berhasil logout" });
  } catch (error) {
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};