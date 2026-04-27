// ============================================================
// routes/report.routes.js
// ============================================================

const router = require("express").Router();
const ctrl = require("../controllers/report.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

router.use(protect);
router.use(requireAdmin);

router.get("/dashboard-stats", ctrl.getDashboardStats);
router.get("/sales-by-month", ctrl.getSalesByMonth);
router.get("/orders-by-status", ctrl.getOrdersByStatus);
router.get("/top-products", ctrl.getTopProducts);
router.get("/low-stock", ctrl.getLowStock);

module.exports = router;