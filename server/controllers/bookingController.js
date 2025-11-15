const db = require("../config/db");

const createBooking = async (req, res) => {
  const {
    service,
    car_brand,
    car_model,
    full_name,
    phone,
    email,
    address,
    appointment_date,
    appointment_time,
  } = req.body;
  const userId = req.user.id;

  if (
    !service ||
    !full_name ||
    !phone ||
    !appointment_date ||
    !appointment_time
  ) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  try {
    await db.execute(
      `INSERT INTO bookings 
       (user_id, service, car_brand, car_model, full_name, phone, email, address, appointment_date, appointment_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        service,
        car_brand || null,
        car_model || null,
        full_name,
        phone,
        email || null,
        address || null,
        appointment_date,
        appointment_time,
      ]
    );
    res.status(201).json({ message: "Đặt lịch thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi đặt lịch" });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải lịch sử" });
  }
};

module.exports = { createBooking, getUserBookings };
