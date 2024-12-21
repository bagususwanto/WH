import Notification from "../models/NotificationModel.js  ";
import User from "../models/UserModel.js";
import Warehouse from "../models/WarehouseModel.js";

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
  const userId = req.user.userId;
  const warehouseId = req.params.warehouseId;

  try {
    // Mencari notifikasi berdasarkan userId
    const notifications = await Notification.findAll({
      where: { userId }, // Menggunakan kondisi untuk memfilter berdasarkan userId
      order: [["createdAt", "DESC"]], // Urutkan berdasarkan waktu pembuatan terbaru
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "username"],
          include: [
            {
              model: Warehouse,
              through: { attributes: [] },
              required: true,
              attributes: ["id", "warehouseName"],
              where: { id: warehouseId },
            },
          ],
        },
      ],
    });

    if (notifications.length === 0) {
      return res
        .status(201)
        .json({ message: "No notifications found for this user." });
    }

    return res.status(200).json(notifications); // Kirim respon dengan data notifikasi
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  const userId = req.user.userId;
  const warehouseId = req.params.warehouseId;

  try {
    // Mencari jumlah notifikasi yang belum dibaca
    const unreadCount = await Notification.count({
      where: {
        userId,
        isRead: 0,
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "username"],
          include: [
            {
              model: Warehouse,
              through: { attributes: [] },
              required: true,
              attributes: ["id", "warehouseName"],
              where: { id: warehouseId },
            },
          ],
        },
      ],
    });

    if (unreadCount === 0) {
      return res
        .status(201)
        .json({ message: "No unread notifications found for this user." });
    }

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return res
      .status(500)
      .json({ message: "Error fetching unread notification count" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const userId = req.user.userId;
  const notificationId = req.params.notificationId;

  try {
    // Mencari notifikasi berdasarkan userId dan notificationId
    const notification = await Notification.findOne({
      where: { userId, id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Mengubah status isRead menjadi true
    notification.isRead = 1;
    await notification.save();

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res
      .status(500)
      .json({ message: "Error marking notification as read" });
  }
};

export const markAllNotificationAsRead = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Mencari semua notifikasi berdasarkan userId
    const notifications = await Notification.findAll({ where: { userId } });

    if (notifications.length === 0) {
      return res
        .status(404)
        .json({ message: "No notifications found for this user." });
    }

    // Mengubah status isRead menjadi true untuk semua notifikasi
    notifications.forEach((notification) => {
      notification.isRead = 1;
    });

    // Simpan perubahan ke database
    await Promise.all(notifications.map((notification) => notification.save()));

    return res
      .status(200)
      .json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res
      .status(500)
      .json({ message: "Error marking all notifications as read" });
  }
};
