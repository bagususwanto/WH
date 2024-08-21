import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const generateTokens = (userId, username, name, roleId) => {
  const accessToken = jwt.sign({ userId, username, name, roleId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });

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

    const user = await Users.findOne({ where: { username, flag: 1 } });
    if (!user) {
      return res.status(404).json({ msg: "Username atau password tidak sesuai" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ msg: "Username atau password tidak sesuai" });
    }

    const { id: userId, name, roleId } = user;
    const { accessToken, refreshToken } = generateTokens(userId, username, name, roleId);

    await Users.update({ refreshToken }, { where: { id: userId, flag: 1 } });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    //   // maxAge: 1 * 60 * 1000, // 1 menit
    // });

    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   // maxAge: 1 * 60 * 60 * 1000, // 1 day
    //   maxAge: 60 * 1000, // 1 menit
    // });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error); // Logging error untuk debugging
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    const user = await Users.findOne({ where: { refreshToken, flag: 1 } });
    if (!user) return res.sendStatus(204);

    await Users.update({ refreshToken: null }, { where: { id: user.id, flag: 1 } });

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.status(200).json({ msg: "Berhasil logout" });
  } catch (error) {
    return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token not found" });

    const user = await Users.findOne({
      where: {
        refreshToken,
        flag: 1,
      },
    });

    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || user.username !== decoded.username) return res.sendStatus(403);

      const { id: userId, username, name, roleId } = user;

      const { accessToken } = generateTokens(userId, username, name, roleId);

      // res.cookie("accessToken", accessToken, {
      //   httpOnly: true,
      //   // maxAge: 1 * 60 * 60 * 1000, // 1 day
      //   maxAge: 60 * 1000, // 1 menit
      // });
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
