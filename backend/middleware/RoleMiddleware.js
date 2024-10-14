export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // const userRoleName = req.user.roleName; // Mengambil roleName dari req.user, yang di-set oleh verifyToken
    const userRoleName = "super admin"; 

    if (allowedRoles.includes(userRoleName)) {
      next(); // Jika roleName sesuai dengan salah satu dari allowedRoles, lanjutkan request
    } else {
      return res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
    }
  };
};
