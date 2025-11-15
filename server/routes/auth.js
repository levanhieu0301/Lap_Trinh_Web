// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

// === ĐĂNG KÝ ===
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0)
      return res.status(400).json({ error: "Email đã tồn tại" });

    const hashedPass = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')",
      [name, email, hashedPass, phone || null]
    );

    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: result.insertId });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// === ĐĂNG NHẬP (TRẢ role TRONG TOKEN) ===
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ error: "Sai email hoặc mật khẩu" });

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ error: "Sai email hoặc mật khẩu" });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user", // TRẢ role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
