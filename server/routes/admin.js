// routes/admin.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// === Chỉ admin (dựa vào role) ===
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Chỉ admin được phép" });
  }
  next();
};

// === LẤY TẤT CẢ USER ===
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy users:", err);
    res.status(500).json({ error: "Lỗi tải người dùng" });
  }
});

// === LẤY TẤT CẢ BOOKINGS ===
router.get("/bookings", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.user_id AS userId,
        b.full_name,
        b.service,
        b.car_brand,
        b.car_model,
        b.appointment_date,
        b.appointment_time,
        b.notes,
        b.status,
        b.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy bookings:", err);
    res.status(500).json({ error: "Lỗi tải lịch đặt" });
  }
});

// === CẬP NHẬT TRẠNG THÁI ===
router.patch("/bookings/:id", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  try {
    const [result] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy lịch" });
    }

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ error: "Cập nhật thất bại" });
  }
});

module.exports = router;
