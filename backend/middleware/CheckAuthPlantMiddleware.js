import Organization from "../models/OrganizationModel";
import User from "../models/UserModel";

export const checkUserPlant = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Ambil userId dari req.user
    const plantId = req.params.plantId; // Ambil plantId dari params

    if (!plantId) {
      return res.status(400).json({ message: "plantId is required" });
    }

    const user = await User.findOne({
      where: { flag: 1, id: userId },
      include: [
        {
          model: Organization,
          where: { flag: 1, id: plantId },
        },
      ],
    });

    // Jika user memiliki akses ke plant
    if (user) {
      return next(); // Lanjutkan ke middleware berikutnya
    } else {
      return res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
