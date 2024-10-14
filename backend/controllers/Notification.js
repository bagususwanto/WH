import Notification from "../models/NotificationModel.js  ";
import Section from "../models/SectionModel";
import UserPlant from "../models/UserPlantModel";

export const createNotification = async (userReq, order, notification) => {
  const { userId, role, sectionId, lineId } = userReq;
  const { title, description, category } = notification;
  const { price } = order;

  const plantId = await UserPlant.findAll({
    attributes: ["plantId"],
    where: { userId, flag: 1 },
  });

  let userIds;

  // Kondisi jika LH yang membuat order
  if (role === "line head") {
    if (price > 20000000) {
      userIds = await Section.findAll({ attributes: ["id"], where: { id: sectionId, flag: 1 } });
    }
  } // Kondisi jika GH yang membuat order
  else if (role === "group head") {
    userIds = await Line.findAll({ attributes: ["id"], where: { id: lineId, flag: 1 } });
  } else {
    // Bypass ke Warehouse
    userIds = await UserPlant.findAll({
      attributes: ["userId"],
      where: { plantId, flag: 1 },
    });
  }

  const notifications = userIds.map((user) => ({
    userId: user,
    title,
    description,
    category,
  }));

  await Notification.bulkCreate(notifications);

  return notifications;
};

export const getNotificationsByUserId = async (req, res) => {
  const { userId } = req.user.userId;

  try {
    // Mencari notifikasi berdasarkan userId
    const notifications = await Notification.findAll({
      where: { userId }, // Menggunakan kondisi untuk memfilter berdasarkan userId
      order: [["createdAt", "DESC"]], // Urutkan berdasarkan waktu pembuatan terbaru
    });

    if (notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found for this user." });
    }

    return res.status(200).json(notifications); // Kirim respon dengan data notifikasi
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  const { userId } = req.user.userId;

  try {
    // Mencari jumlah notifikasi yang belum dibaca
    const unreadCount = await Notification.count({
      where: {
        userId,
        isRead: 0,
      },
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return res.status(500).json({ message: "Error fetching unread notification count" });
  }
};
