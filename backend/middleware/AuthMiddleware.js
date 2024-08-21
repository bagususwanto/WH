import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const authenticateUser = (req, res, next) => {
  const accessToken = req.cookies.accessToken; // Ambil accessToken dari cookies

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized token expired" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};
