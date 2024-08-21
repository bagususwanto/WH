// Example of setting user object in req in an authentication middleware
import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (token == null) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed." });
  }
};
