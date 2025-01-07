import express from "express";

const router = express.Router();

// Mock data for notifications (replace with your database logic)
let notifications = [];

// Route: Get all notifications
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fetched all notifications successfully",
    data: notifications,
  });
});

// Route: Create a new notification
router.post("/", (req, res) => {
  const { title, message, userId } = req.body;

  if (!title || !message || !userId) {
    return res.status(400).json({
      success: false,
      message: "Title, message, and userId are required",
    });
  }

  const newNotification = {
    id: Date.now(), // Use a unique ID generator like UUID in production
    title,
    message,
    userId,
    createdAt: new Date(),
  };

  notifications.push(newNotification);

  res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: newNotification,
  });
});

// Route: Delete a notification
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = notifications.length;

  notifications = notifications.filter((notification) => notification.id !== parseInt(id));

  if (notifications.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

export default router;
