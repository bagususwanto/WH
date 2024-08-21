import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await Users.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);

      const userId = user.id;
      const username = user.username;
      const name = user.name;
      const roleId = user.roleId;

      const accessToken = jwt.sign({ userId, username, name, roleId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "20s",
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
