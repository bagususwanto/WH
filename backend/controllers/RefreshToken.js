import Users from "../models/UserModel.js";
import Shops from "../models/shopModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await Users.findOne({
      where: {
        refreshToken: refreshToken,
      },
      include: [
        {
          model: Shops,
          attributes: ["shopName"],
        },
      ],
    });

    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);

      const userId = user.id;
      const username = user.username;
      const name = user.name;
      const role = user.role;
      const shopName = user.Shop ? user.Shop.shopName : null; // Ambil shopName dari asosiasi

      const accessToken = jwt.sign({ userId, username, name, role, shopName }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15s",
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
