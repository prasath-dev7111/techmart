// ============================================================
// utils/helpers.js – Shared utility functions
// ============================================================

// Format a number as Indian Rupee currency string
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// Get month name from month number (1-12)
const monthName = (num) =>
  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][num - 1];

module.exports = { formatCurrency, monthName };
