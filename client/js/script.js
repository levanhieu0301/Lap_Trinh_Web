/* ============================================
   SCRIPT.JS - CHUNG CHO TOÀN SITE
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  checkAuthStatus();
});

/**
 * Khởi tạo menu mobile (nút hamburger)
 */
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    // Tự động đóng menu khi bấm vào link trên mobile
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }
}

/**
 * Kiểm tra trạng thái đăng nhập để ẩn/hiện link
 */
function checkAuthStatus() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const loginLink = document.getElementById("loginLink");
  const profileLink = document.getElementById("profileLink");

  if (user) {
    // Đã đăng nhập
    if (loginLink) loginLink.style.display = "none";
    if (profileLink) profileLink.style.display = "block";
  } else {
    // Chưa đăng nhập
    if (loginLink) loginLink.style.display = "block";
    if (profileLink) profileLink.style.display = "none";
  }
}