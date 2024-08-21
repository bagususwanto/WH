import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await Users.findAll({
      where: {
        refreshToken: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);
      const userId = user[0].id;
      const username = user[0].username;
      const name = user[0].name;
      const roleId = user[0].roleId;
      const accessToken = jwt.sign({ userId, username, name, roleId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "60s",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // Ubah ke true jika menggunakan HTTPS
        sameSite: "Lax", // Atur sesuai kebutuhan
        maxAge: 60 * 1000, // 20 seconds
      });
      // res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
  }
};
