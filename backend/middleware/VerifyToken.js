import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Access header directly
  const token = authHeader?.split(" ")[1]; 

  if (!token) return res.sendStatus(401); 

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    // Add decoded information to request object
    req.user = {
      username: decoded.username,
      userId: decoded.userId,
      roleName: decoded.roleName,
    };

    next();
  });
};
