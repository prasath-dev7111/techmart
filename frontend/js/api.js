// ============================================================
// js/api.js — Centralized API fetch wrapper
// All HTTP calls go through this file.
// ============================================================

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://techmart-backend.onrender.com/api";

// ── Core fetch wrapper ───────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('tm_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  let data;
try {
  data = await res.json();
} catch {
  data = {};
}

  if (!res.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────
window.Auth = {
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body }),
  register: (body) => apiFetch('/auth/register', { method: 'POST', body }),
  getMe:    ()     => apiFetch('/auth/me')
};

// ── Products ─────────────────────────────────────────────────
const Products = {
  getAll:   (params = '') => apiFetch(`/products?${params}`),
  getOne:   (id)    => apiFetch(`/products/${id}`),
  create:   (body)  => apiFetch('/products',  { method: 'POST', body }),
  update:   (id, body) => apiFetch(`/products/${id}`, { method: 'PUT', body }),
  delete:   (id)    => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  updateStock: (id, stock) => apiFetch(`/products/${id}/stock`, { method: 'PATCH', body: { stock } }),
  importExternal: () => apiFetch('/products/import-external', { method: 'POST' })
};

// ── Categories ───────────────────────────────────────────────
const Categories = {
  getAll:  ()        => apiFetch('/categories'),
  create:  (body)    => apiFetch('/categories',     { method: 'POST', body }),
  update:  (id, body)=> apiFetch(`/categories/${id}`, { method: 'PUT', body }),
  delete:  (id)      => apiFetch(`/categories/${id}`, { method: 'DELETE' })
};

// ── Orders ───────────────────────────────────────────────────
const Orders = {
  getAll:   (params = '') => apiFetch(`/orders?${params}`),
  getOne:   (id)    => apiFetch(`/orders/${id}`),
  create:   (body)  => apiFetch('/orders',  { method: 'POST', body }),
  updateStatus:  (id, body) => apiFetch(`/orders/${id}/status`,  { method: 'PATCH', body }),
  updatePayment: (id, body) => apiFetch(`/orders/${id}/payment`, { method: 'PATCH', body })
};

// ── Customers ─────────────────────────────────────────────────
const Customers = {
  getAll:  (params = '') => apiFetch(`/customers?${params}`),
  getOne:  (id)    => apiFetch(`/customers/${id}`),
  create:  (body)  => apiFetch('/customers',     { method: 'POST', body }),
  update:  (id, body) => apiFetch(`/customers/${id}`, { method: 'PUT', body }),
  delete:  (id)    => apiFetch(`/customers/${id}`, { method: 'DELETE' })
};

// ── Reports ──────────────────────────────────────────────────
const Reports = {
  dashboardStats: () => apiFetch('/reports/dashboard-stats'),
  salesByMonth:   () => apiFetch('/reports/sales-by-month'),
  ordersByStatus: () => apiFetch('/reports/orders-by-status'),
  topProducts:    () => apiFetch('/reports/top-products'),
  lowStock:       () => apiFetch('/reports/low-stock')
};
