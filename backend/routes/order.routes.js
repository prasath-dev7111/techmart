// ============================================================
// routes/order.routes.js
// ============================================================

const router = require('express').Router();
const ctrl   = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/',                    ctrl.getAllOrders);
router.post('/',                   ctrl.createOrder);
router.get('/:id',                 ctrl.getOrder);
router.patch('/:id/status',        ctrl.updateOrderStatus);
router.patch('/:id/payment',       ctrl.updatePaymentStatus);

module.exports = router;
