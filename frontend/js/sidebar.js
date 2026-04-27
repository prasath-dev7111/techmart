// ============================================================
// js/sidebar.js — Injects sidebar into every admin page
// Updated: theme toggle, role-based route protection
// ============================================================

function injectSidebar() {
  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon"><i class="ri-gamepad-line"></i></div>
      <div>
        <div class="logo-text">TechMart</div>
        <span class="logo-sub">Admin Panel</span>
      </div>
    </div>
    <div class="nav-section">
      <div class="nav-section-label">Main</div>
      <a href="dashboard.html"  class="nav-item"><i class="ri-dashboard-line"></i> Dashboard</a>
      <a href="orders.html"     class="nav-item"><i class="ri-shopping-bag-line"></i> Orders</a>
      <a href="products.html"   class="nav-item"><i class="ri-box-3-line"></i> Products</a>
      <a href="inventory.html"  class="nav-item"><i class="ri-stack-line"></i> Inventory</a>
    </div>
    <div class="nav-section">
      <div class="nav-section-label">Management</div>
      <a href="categories.html" class="nav-item"><i class="ri-folder-open-line"></i> Categories</a>
      <a href="customers.html"  class="nav-item"><i class="ri-group-line"></i> Customers</a>
      <a href="reports.html"    class="nav-item"><i class="ri-bar-chart-line"></i> Reports</a>
    </div>
    <div class="sidebar-footer">
      <a href="landing.html" class="nav-item" style="font-size:.82rem">
        <i class="ri-store-2-line"></i> View Store
      </a>
      <a class="nav-item" onclick="logout()" style="cursor:pointer">
        <i class="ri-logout-box-r-line"></i> Sign Out
      </a>
    </div>
  `;
  document.querySelector('.app-shell').prepend(sidebar);
  markActiveNav();
}

function injectTopbar(pageTitle) {
  const user = getUser();
  const savedTheme = localStorage.getItem('tm_theme') || 'dark';
  const themeIcon = savedTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  topbar.innerHTML = `
    <div class="topbar-left">
      <button class="mob-menu-btn" onclick="toggleSidebarMobile()" style="display:none;background:none;border:none;color:var(--text-secondary);font-size:1.3rem;cursor:pointer;padding:4px;margin-right:8px"><i class="ri-menu-line"></i></button>
      <span class="topbar-title">${pageTitle}</span>
    </div>
    <div class="topbar-right">
      <button onclick="toggleAdminTheme()" title="Toggle theme" id="admin-theme-btn"
        style="width:36px;height:36px;border-radius:8px;background:var(--bg-elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--text-secondary);cursor:pointer;transition:all .2s">
        <i class="${themeIcon}" id="admin-theme-icon"></i>
      </button>
      <div class="user-badge">
        <div class="user-avatar" id="user-avatar">${user?.name?.charAt(0).toUpperCase() || 'A'}</div>
        <span class="user-name" id="user-name">${user?.name || 'Admin'}</span>
        <i class="ri-arrow-down-s-line" style="color:var(--text-muted)"></i>
      </div>
    </div>
  `;
  document.querySelector('.main-content').prepend(topbar);
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme','light');
  if (window.innerWidth <= 768) topbar.querySelector('.mob-menu-btn').style.display = 'block';
}

function toggleAdminTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('admin-theme-icon');
  if (!html.dataset.theme || html.dataset.theme === 'dark') {
    html.dataset.theme = 'light'; if(icon) icon.className = 'ri-moon-line';
    localStorage.setItem('tm_theme','light');
  } else {
    html.dataset.theme = 'dark'; if(icon) icon.className = 'ri-sun-line';
    localStorage.setItem('tm_theme','dark');
  }
}

function toggleSidebarMobile() {
  const s = document.querySelector('.sidebar');
  if (s) s.classList.toggle('open');
}

function requireAdmin() {
  const token = getToken(), user = getUser();
  if (!token || !user) { window.location.href = 'index.html'; return; }
  if (user.role !== 'admin') window.location.href = 'landing.html';
}

function initPage(pageTitle) {
  requireAdmin();
  injectSidebar();
  injectTopbar(pageTitle);
}
