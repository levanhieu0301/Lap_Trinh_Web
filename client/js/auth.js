// frontend/js/auth.js

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

      // Xóa thông báo lỗi cũ khi chuyển tab
      clearErrors();
    });
  });

  // Gắn sự kiện form
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  // Xóa lỗi khi người dùng bắt đầu nhập
  loginForm
    ?.querySelectorAll("input")
    .forEach((input) =>
      input.addEventListener("input", () => clearErrors())
    );
  registerForm
    ?.querySelectorAll("input")
    .forEach((input) =>
      input.addEventListener("input", () => clearErrors())
    );
});

// === HÀM ĐĂNG KÝ ===
async function handleRegister(e) {
  e.preventDefault();
  clearErrors();

  const formData = new FormData(e.target);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  // Kiểm tra mật khẩu khớp (client-side)
  if (data.password !== data.confirmPassword) {
    showRegisterError("Mật khẩu không khớp!");
    return;
  }
  
  if (data.password.length < 6) {
    showRegisterError("Mật khẩu phải có ít nhất 6 ký tự!");
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
      showRegisterSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      // Tự động chuyển tab
      setTimeout(() => {
        document.querySelector('[data-tab="login"]').click();
        e.target.reset(); // Xóa form
      }, 1500);
    } else {
      // Hiển thị lỗi từ server
      showRegisterError(json.error || "Lỗi đăng ký");
    }
  } catch (err) {
    showRegisterError("Không kết nối được đến server. Vui lòng thử lại.");
  }
}

// === HÀM ĐĂNG NHẬP ===
async function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showLoginError("Vui lòng nhập đầy đủ email và mật khẩu!");
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
      // Hiển thị lỗi từ server
      showLoginError(json.error || "Sai email hoặc mật khẩu");
    }
  } catch (err) {
    showLoginError("Không kết nối được đến server. Vui lòng thử lại.");
  }
}

// --- Hàm hỗ trợ hiển thị lỗi ---

function showLoginError(message) {
  const errorDiv = document.getElementById("loginError");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

function showRegisterError(message) {
  const msgDiv = document.getElementById("registerSuccess");
  if (msgDiv) {
    msgDiv.textContent = message;
    msgDiv.className = "error-message"; // Đổi class để CSS (bạn cần định nghĩa class này)
    msgDiv.style.color = "var(--error)"; // Ghi đè style
    msgDiv.style.background = "var(--bg-light)";
    msgDiv.style.border = "1px solid var(--error)";
    msgDiv.style.display = "block";
  }
}

function showRegisterSuccess(message) {
  const msgDiv = document.getElementById("registerSuccess");
  if (msgDiv) {
    msgDiv.textContent = message;
    msgDiv.className = "success-message"; // Trả lại class success
    // Reset style
    msgDiv.style.color = "";
    msgDiv.style.background = "";
    msgDiv.style.border = "";
    msgDiv.style.display = "block";
  }
}

function clearErrors() {
  const loginError = document.getElementById("loginError");
  const registerMsg = document.getElementById("registerSuccess");
  if (loginError) loginError.style.display = "none";
  if (registerMsg) registerMsg.style.display = "none";
}