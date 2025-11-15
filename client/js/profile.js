/* ============================================
   PROFILE.JS - LẤY LỊCH SỬ TỪ DATABASE (MySQL)
   ============================================ */

const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async function () {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const token = localStorage.getItem("token");

  // === KIỂM TRA ĐĂNG NHẬP ===
  if (!user || !token) {
    alert("Vui lòng đăng nhập để xem hồ sơ!");
    window.location.href = "login.html";
    return;
  }

  console.log("User đang đăng nhập:", user); // DEBUG

  // === HIỂN THỊ THÔNG TIN USER ===
  document.getElementById("userName").textContent =
    user.name || "Chưa cập nhật";
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userPhone").textContent =
    user.phone || "Chưa cập nhật";

  // === LẤY LỊCH SỬ TỪ API ===
  const bookingList = document.getElementById("bookingList");
  const noBooking = document.getElementById("noBooking");

  try {
    console.log("Đang gọi API lấy lịch user:", user.id); // DEBUG
    const res = await fetch(`${API_URL}/bookings/user/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra phản hồi
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const userBookings = await res.json();
    console.log("Lịch sử đặt dịch vụ:", userBookings); // DEBUG

    // Hiển thị kết quả
    if (!userBookings || userBookings.length === 0) {
      noBooking.textContent = "Chưa có lịch đặt nào.";
      noBooking.style.display = "block";
      bookingList.style.display = "none";
    } else {
      noBooking.style.display = "none";
      bookingList.style.display = "grid";

      userBookings.forEach((booking) => {
        const item = document.createElement("div");
        item.className = "booking-item";

        const statusClass =
          {
            pending: "status-pending",
            confirmed: "status-confirmed",
            cancelled: "status-cancelled",
          }[booking.status] || "status-pending";

        const statusText =
          {
            pending: "Đang chờ",
            confirmed: "Đã xác nhận",
            cancelled: "Đã hủy",
          }[booking.status] || "Không rõ";

        item.innerHTML = `
          <div class="booking-service">${booking.serviceType}</div>
          <div class="booking-date">Ngày: ${formatDate(
            booking.appointmentDate
          )} | ${booking.appointmentTime}</div>
          <span class="booking-status ${statusClass}">${statusText}</span>
        `;
        bookingList.appendChild(item);
      });
    }
  } catch (err) {
    console.error("Lỗi tải lịch sử:", err);
    noBooking.textContent = "Lỗi tải lịch sử đặt dịch vụ. Vui lòng thử lại.";
    noBooking.style.display = "block";
    bookingList.style.display = "none";
  }

  // === NÚT ĐĂNG XUẤT ===
  document.getElementById("logoutBtn").addEventListener("click", function () {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      alert("Đăng xuất thành công!");
      window.location.href = "index.html";
    }
  });

  // === NÚT CHỈNH SỬA ===
  document.getElementById("editProfileBtn").addEventListener("click", () => {
    window.location.href = "edit-profile.html";
  });

  // === MENU MOBILE ===
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () =>
      navMenu.classList.toggle("active")
    );
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navMenu.classList.remove("active"));
    });
  }
});

// === HỖ TRỢ ===
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return "Không xác định";
  }
}
