// frontend/js/auth.js
const API_URL = "http://localhost:5000/api"; // ĐÚNG VỚI BACKEND

document.addEventListener("DOMContentLoaded", () => {
  // Tab chuyển đổi
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".auth-tab-content")
        .forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab + "Tab").classList.add("active");
    });
  });

  // Gắn sự kiện form
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
});

// === HÀM ĐĂNG KÝ ===
async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Kiểm tra mật khẩu khớp
  if (data.password !== data.confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (res.ok) {
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      document.querySelector('[data-tab="login"]').click();
      e.target.reset(); // Xóa form
    } else {
      alert(json.error || "Lỗi đăng ký");
    }
  } catch (err) {
    alert("Không kết nối được đến server. Kiểm tra backend!");
  }
}

// === HÀM ĐĂNG NHẬP ===
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Vui lòng nhập đầy đủ email và mật khẩu!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (res.ok) {
      // Lưu token và user
      localStorage.setItem("token", json.token);
      localStorage.setItem("currentUser", JSON.stringify(json.user));

      // Chuyển trang theo role
      if (json.user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "profile.html";
      }
    } else {
      alert(json.error || "Sai email hoặc mật khẩu");
    }
  } catch (err) {
    alert("Không kết nối được đến server. Kiểm tra backend!");
  }
}
