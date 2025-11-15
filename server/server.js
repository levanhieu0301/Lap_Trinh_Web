// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

const db = require("./config/db");

db.getConnection()
  .then(() => console.log("KẾT NỐI DATABASE THÀNH CÔNG!"))
  .catch((err) => {
    console.error("LỖI KẾT NỐI DATABASE:", err.message);
    process.exit(1);
  });

const app = express();

app.use(cors());
app.use(express.json());

// Trang chủ API
app.get("/", (req, res) => {
  res.json({
    message: "AutoCare Backend API - Đang hoạt động!",
    endpoints: {
      auth: "/api/auth",
      bookings: "/api/bookings",
      admin: "/api/admin",
      users: "/api/users",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend chạy tại: http://localhost:${PORT}`);
});
