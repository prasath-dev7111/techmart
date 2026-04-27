// ============================================================
// js/auth.js — Auth helpers, route guards, toast, formatting
// Fixed: removed duplicate logout(), added requireAdmin()
// ============================================================

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, { position:'fixed', bottom:'24px', right:'24px', zIndex:'9999', display:'flex', flexDirection:'column', gap:'10px' });
    document.body.appendChild(container);
  }
  const iconMap  = { success:'ri-checkbox-circle-fill', error:'ri-error-warning-fill', info:'ri-information-fill' };
  const colorMap = { success:'var(--success)', error:'var(--danger)', info:'var(--accent)' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${iconMap[type]}" style="color:${colorMap[type]};font-size:1.1rem"></i><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Session ───────────────────────────────────────────────────
function saveSession(token, user) {
  localStorage.setItem('tm_token', token);
  localStorage.setItem('tm_user',  JSON.stringify(user));
}
function getUser()  { try { return JSON.parse(localStorage.getItem('tm_user')); } catch { return null; } }
function getToken() { return localStorage.getItem('tm_token'); }
function clearSession() { localStorage.removeItem('tm_token'); localStorage.removeItem('tm_user'); }

// ── Role checks ───────────────────────────────────────────────
function isAdmin() {
  const u = getUser();
  return u && ['admin','manager','staff'].includes(u.role);
}
function isRegularUser() {
  const u = getUser();
  return u && u.role === 'user';
}

// ── Route guards ──────────────────────────────────────────────
// Require any auth (user OR admin) — redirect to login if not
function requireAuth() {
  if (!getToken() || !getUser()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Admin-only pages (dashboard, orders, products, etc.)
// Redirects non-admins back to login immediately
function requireAdmin() {
  if (!getToken() || !getUser()) {
    window.location.href = 'index.html';
    return false;
  }
  if (!isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Regular-user-only pages
function requireUser() {
  if (!getToken() || !getUser()) {
    window.location.href = 'index.html';
    return false;
  }
  if (isAdmin()) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

// Smart redirect after login based on role
function redirectAfterLogin(user) {
  const u = user || getUser();
  if (!u) { window.location.href = 'index.html'; return; }
  if (['admin','manager','staff'].includes(u.role)) {
    window.location.href = 'dashboard.html';
  } else {
    window.location.href = 'landing.html';
  }
}

// ── Single logout (fixed duplicate) ──────────────────────────
function logout() {
  clearSession();
  window.location.href = 'index.html';
}

function doLogout() { logout(); }

// ── Topbar badge ──────────────────────────────────────────────
function populateUserBadge() {
  const user = getUser();
  if (!user) return;
  const nameEl   = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl)   nameEl.textContent   = user.name;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}

// ── Active nav highlight ──────────────────────────────────────
function markActiveNav() {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === current) link.classList.add('active');
  });
}

// ── Formatters ────────────────────────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR' }).format(amount || 0);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function statusBadge(status) {
  const map = {
    'Placed':'badge-placed','Processing':'badge-processing','Shipped':'badge-shipped',
    'Delivered':'badge-delivered','Cancelled':'badge-cancelled','Paid':'badge-paid',
    'Pending':'badge-pending','Failed':'badge-failed','Refunded':'badge-failed',
    'In Stock':'badge-in-stock','Low Stock':'badge-low-stock','Out of Stock':'badge-out'
  };
  return `<span class="badge ${map[status]||''}">${status}</span>`;
}
