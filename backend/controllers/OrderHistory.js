import OrderHistory from "../models/OrderHistoryModel.js";

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
  } else if (status.includes("otodoke")) {
    return "cilTruck";
  } else if (status.includes("pickup")) {
    return "cilWalk";
  } else {
    return "cilCircle";
  }
};
