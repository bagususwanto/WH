import User from "../models/UserModel.js";

export const PASSWORD_EXPIRATION_DAYS = 90;

export const checkPasswordExpiration = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.passwordUpdatedAt) {
      return res.status(403).json({ message: "Password must be reset." });
    }

    const lastUpdated = new Date(user.passwordUpdatedAt);
    const now = new Date();
    const diffDays = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

    if (diffDays > PASSWORD_EXPIRATION_DAYS) {
      return res
        .status(403)
        .json({ message: "Password has expired. Please reset it." });
    }

    next();
  } catch (error) {
    console.error("Error checking password expiration:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};
