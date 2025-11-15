// routes/booking.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

// === 1. ĐẶT LỊCH (User) ===
router.post("/", authMiddleware, async (req, res) => {
  const {
    full_name,
    phone,
    email,
    address,
    service,
    car_brand,
    car_model,
    appointment_date,
    appointment_time,
    notes,
  } = req.body;

  const user_id = req.user.id;

  // Kiểm tra bắt buộc
  if (
    !full_name ||
    !phone ||
    !email ||
    !address ||
    !service ||
    !appointment_date ||
    !appointment_time
  ) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, full_name, phone, email, address, service, car_brand, car_model, appointment_date, appointment_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        user_id,
        full_name,
        phone,
        email,
        address,
        service,
        car_brand || null,
        car_model || null,
        appointment_date,
        appointment_time,
        notes || null,
      ]
    );

    console.log(
      `[API] Đặt lịch thành công cho user ${user_id}, ID: ${result.insertId}`
    );
    res.status(201).json({
      message: "Đặt lịch thành công!",
      bookingId: result.insertId,
    });
  } catch (err) {
    console.error("Lỗi đặt lịch:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// === 2. LẤY LỊCH CỦA USER (profile.html) ===
router.get("/user/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (parseInt(userId) !== currentUserId) {
    return res.status(403).json({ error: "Không có quyền" });
  }

  try {
    console.log(`[API] Lấy lịch cho user ID: ${userId}`);

    const [rows] = await db.query(
      `SELECT 
         id,
         service AS serviceType,           -- Đổi tên để frontend nhận đúng
         appointment_date AS appointmentDate,
         appointment_time AS appointmentTime,
         status,
         created_at AS createdAt
       FROM bookings 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`[API] Tìm thấy ${rows.length} lịch cho user ${userId}`);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy lịch user:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// === 3. ADMIN: LẤY TẤT CẢ BOOKINGS ===
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.email !== "admin@autocare.com") {
    return res.status(403).json({ error: "Chỉ admin được phép" });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.user_id,
        b.full_name,
        b.service,
        b.car_brand,
        b.car_model,
        b.appointment_date,
        b.appointment_time,
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
    console.error("Lỗi admin lấy booking:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// === 4. ADMIN: CẬP NHẬT TRẠNG THÁI ===
router.patch("/status/:id", authMiddleware, async (req, res) => {
  if (req.user.email !== "admin@autocare.com") {
    return res.status(403).json({ error: "Chỉ admin được phép" });
  }

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

    console.log(`[API] Admin cập nhật trạng thái booking ${id} → ${status}`);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ error: "Cập nhật thất bại" });
  }
});

module.exports = router;
