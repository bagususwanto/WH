export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRoleId = req.user.roleId; // Mengambil roleId dari req.user, yang di-set oleh authenticateUser

    if (allowedRoles.includes(userRoleId)) {
      next(); // Jika roleId sesuai dengan salah satu dari allowedRoles, lanjutkan request
    } else {
      return res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
    }
  };
};
