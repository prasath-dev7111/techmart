// ============================================================
// controllers/report.controller.js
// Generates analytics from raw DB data
// ============================================================

const Order   = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// ── GET /api/reports/dashboard-stats ─────────────────────────
// KPI cards on the main dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalCustomers, totalProducts, revenueAgg] = await Promise.all([
      Order.countDocuments(),
      Customer.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      data: { totalOrders, totalCustomers, totalProducts, totalRevenue }
    });
  } catch (err) { next(err); }
};

// ── GET /api/reports/sales-by-month ──────────────────────────
// Revenue grouped by month (for line/bar chart)
exports.getSalesByMonth = async (req, res, next) => {
  try {
    const sales = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({ success: true, data: sales });
  } catch (err) { next(err); }
};

// ── GET /api/reports/orders-by-status ────────────────────────
// Counts per order status (for pie/doughnut chart)
exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── GET /api/reports/top-products ────────────────────────────
// Best-selling products by total qty sold
exports.getTopProducts = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ── GET /api/reports/low-stock ────────────────────────────────
exports.getLowStock = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockAlert'] }
    }).populate('category', 'name').limit(20);

    res.json({ success: true, data: products });
  } catch (err) { next(err); }
};
