import OrderHistory from "../models/OrderHistoryModel.js";
import User from "../models/UserModel.js";

export const postOrderHistory = async (status, userId, orderId) => {
  try {
    const icon = getIconByStatus(status);

    await OrderHistory.create({
      status: status,
      icon: icon,
      userId: userId,
      orderId: orderId,
    });

    return true;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getIconByStatus = (status) => {
  if (status.includes("approved")) {
    return "cilUser";
  } else if (status.includes("rejected")) {
    return "cilUser";
  } else if (status.includes("accepted")) {
    return "cilHome";
  } else if (status.includes("received")) {
    return "cilCheckCircle";
  } else if (status.includes("created")) {
    return "cilClipboard";
  } else if (status.includes("deliver")) {
    return "cilTruck";
  } else if (status.includes("pickup")) {
    return "cilWalk";
  } else {
    return "cilCircle";
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const response = await OrderHistory.findAll({
      where: { orderId: orderId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username", "name"],
        },
      ],
    });

    if (!response) {
      return res.status(404).json({ message: "Order history not found" });
    }

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
