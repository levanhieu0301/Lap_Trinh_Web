// controllers/userController.js
const db = require("../config/db");
const bcrypt = require("bcrypt");

const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, password } = req.body;
  const userId = req.user.id;

  if (!name || !phone)
    return res.status(400).json({ error: "Thiếu thông tin" });

  try {
    let query = "UPDATE users SET name = ?, phone = ? WHERE id = ?";
    let params = [name, phone, userId];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query = "UPDATE users SET name = ?, phone = ?, password = ? WHERE id = ?";
      params = [name, phone, hashed, userId];
    }

    const [result] = await db.query(query, params);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Không tìm thấy" });

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { getProfile, updateProfile };
