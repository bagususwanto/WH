export const checkRole = (allowedRoles, allowedWarehouse = [0]) => {
  return (req, res, next) => {
    const userRoleName = req.user.roleName; // Mengambil roleName dari req.user, yang di-set oleh verifyToken
    const isWarehouse = req.user.isWarehouse;
    let paramsAllowedWH = allowedWarehouse;
    // const userRoleName = "super admin";

    if (isWarehouse == 1) {
      paramsAllowedWH = [1];
    }

    if (
      allowedRoles.includes(userRoleName) &&
      paramsAllowedWH.includes(isWarehouse)
    ) {
      next(); // Jika roleName sesuai dengan salah satu dari allowedRoles, lanjutkan request
    } else {
      return res.status(403).json({
        message: "Forbidden: You do not have the required permissions",
      });
    }
  };
};
