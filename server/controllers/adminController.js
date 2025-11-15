const db = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, email, phone, role, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách người dùng" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b.*, u.name as user_name, u.email as user_email 
      FROM bookings b 
      JOIN users u ON b.user_id = u.id 
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách lịch đặt" });
  }
};

const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy lịch đặt" });
    }
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
  }
};

module.exports = { getAllUsers, getAllBookings, updateBookingStatus };
