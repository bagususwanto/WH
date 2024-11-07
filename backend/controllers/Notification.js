import Notification from "../models/NotificationModel.js  ";

export const createNotification = async (userIds, notification) => {
  const { title, description, category } = notification;

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
  const userId  = req.user.userId;

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
  const userId  = req.user.userId;

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
