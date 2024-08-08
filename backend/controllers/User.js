import User from "../models/UserModel.js";
import Shops from "../models/ShopModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const user = await User.findAll({
      attributes: ["id", "username", "name", "role", "shopId"],
      include: [
        {
          model: Shops,
          attributes: ["shopName"],
        },
      ],
    });
    res.json(user);
  } catch (error) {
    console.log(error);
  }
};

export const Register = async (req, res) => {
  const { username, password, name, role, shopId, updateBy, cretedBy, confPassword } = req.body;
  if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    const existingUser = await User.findOne({
      where: {
        username: username,
      },
    });
    if (existingUser) {
      return res.status(400).json({ msg: "Username sudah digunakan" });
    }
    await User.create({
      username: username,
      password: hashPassword,
      name: name,
      role: role,
      shopId: shopId,
      updateBy: updateBy,
      cretedBy: cretedBy,
    });
    res.json({ msg: "Register Berhasil" });
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const user = await User.findAll({
      where: {
        username: req.body.username,
      },
    });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({ msg: "Password Salah" });
    const userId = user[0].id;
    const username = user[0].username;
    const name = user[0].name;
    const role = user[0].role;
    const shopId = user[0].shopId;
    const accessToken = jwt.sign({ userId, username, name, role, shopId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "20s",
    });
    const refreshToken = jwt.sign({ userId, username, name, role, shopId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    await User.update(
      { refreshToken: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({ msg: "Username tidak ditemukan" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await User.findAll({
    where: {
      refreshToken: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await User.update(
    { refreshToken: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};
