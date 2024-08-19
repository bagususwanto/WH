// middleware/roleMiddleware.js
export const checkRole = (roleId) => {
  return (req, res, next) => {
    const userRole = req.user?.roleId;

    if (roleId.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
  };
};

