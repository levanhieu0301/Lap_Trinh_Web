// js/admin.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  // KIỂM TRA role === 'admin'
  if (!token || user.role !== "admin") {
    alert("Không có quyền truy cập!");
    window.location.href = "login.html";
    return;
  }

  await loadDashboard();

  // === ĐĂNG XUẤT ===
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.onclick = (e) => {
      e.preventDefault();
      if (confirm("Đăng xuất admin?")) {
        localStorage.clear();
        alert("Đã đăng xuất!");
        location.href = "login.html";
      }
    };
  }
});

async function loadDashboard() {
  const token = localStorage.getItem("token");

  try {
    const [usersRes, bookingsRes] = await Promise.all([
      fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!usersRes.ok || !bookingsRes.ok) throw new Error("Lỗi tải dữ liệu");

    const users = await usersRes.json();
    const bookings = await bookingsRes.json();

    // === THỐNG KÊ ===
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalBookings").textContent = bookings.length;
    document.getElementById("pendingBookings").textContent = bookings.filter(
      (b) => b.status === "pending"
    ).length;

    // === BẢNG USER ===
    const usersTbody = document.querySelector("#usersTable tbody");
    usersTbody.innerHTML = "";
    users.forEach((u) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.id}</td>
        <td>${u.name || "—"} ${
        u.role === "admin" ? '<span style="color:green">(Admin)</span>' : ""
      }</td>
        <td>${u.email}</td>
        <td>${u.phone || "—"}</td>
        <td>${formatDate(u.created_at)}</td>
      `;
      usersTbody.appendChild(row);
    });

    // === BẢNG BOOKING ===
    const bookingsTbody = document.querySelector("#bookingsTable tbody");
    bookingsTbody.innerHTML = "";
    bookings.forEach((b) => {
      const statusClass =
        {
          pending: "status-pending",
          confirmed: "status-confirmed",
          cancelled: "status-cancelled",
        }[b.status] || "status-pending";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${b.id}</td>
        <td>${b.full_name} (${b.user_name || "—"})</td>
        <td>${b.service} (${b.car_brand} ${b.car_model})</td>
        <td>${formatDate(b.appointment_date)} ${b.appointment_time}</td>
        <td><span class="status ${statusClass}">${getStatusText(
        b.status
      )}</span></td>
        <td>
          ${
            b.status === "pending"
              ? `
            <button class="action-btn btn-confirm" onclick="updateStatus(${b.id}, 'confirmed')">Duyệt</button>
            <button class="action-btn btn-cancel" onclick="updateStatus(${b.id}, 'cancelled')">Hủy</button>
          `
              : "—"
          }
        </td>
      `;
      bookingsTbody.appendChild(row);
    });
  } catch (err) {
    console.error("Lỗi tải dashboard:", err);
    alert("Lỗi tải dữ liệu. Vui lòng thử lại.");
  }
}

window.updateStatus = async (id, status) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      alert(`Đã ${status === "confirmed" ? "duyệt" : "hủy"} lịch!`);
      location.reload();
    } else {
      const err = await res.json();
      alert(err.error || "Cập nhật thất bại");
    }
  } catch (err) {
    alert("Lỗi kết nối");
  }
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function getStatusText(s) {
  return (
    { pending: "Chờ duyệt", confirmed: "Đã duyệt", cancelled: "Đã hủy" }[s] || s
  );
}