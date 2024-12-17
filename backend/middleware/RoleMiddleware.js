export const checkRole = (allowedRoles, allowedRoleProduction = [1]) => {
  return (req, res, next) => {
    const userRoleName = req.user.roleName; // Mengambil roleName dari req.user, yang di-set oleh verifyToken
    const isProduction = req.user.isProduction;

    // const userRoleName = "super admin";

    if (
      allowedRoles.includes(userRoleName) &&
      allowedRoleProduction.includes(isProduction)
    ) {
      next(); // Jika roleName sesuai dengan salah satu dari allowedRoles, lanjutkan request
    } else {
      return res.status(403).json({
        message: "Forbidden: You do not have the required permissions",
      });
    }
  };
};
