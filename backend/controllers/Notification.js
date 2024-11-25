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
              as: "alternateWarehouse",
              required: true,
              attributes: ["id", "warehouseName"],
              where: { id: warehouseId },
            },
          ],
        },
      ],
    });

    if (notifications.length === 0) {
      return res.status(201).json({ message: "No notifications found for this user." });
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
              as: "alternateWarehouse",
              required: true,
              attributes: ["id", "warehouseName"],
              where: { id: warehouseId },
            },
          ],
        },
      ],
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    return res.status(500).json({ message: "Error fetching unread notification count" });
  }
};
