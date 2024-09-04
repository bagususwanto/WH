import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Akses header langsung
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided. Unauthorized access!" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token. Access forbidden!" });
    }

    // Tambahkan informasi yang sudah didekodekan ke objek request
    req.user = {
      username: decoded.username,
      userId: decoded.userId,
      roleName: decoded.roleName,
    };

    next();
  });
};
