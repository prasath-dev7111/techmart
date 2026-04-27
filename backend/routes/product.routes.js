// ============================================================
// routes/product.routes.js
// Public: GET / and GET /:id (for landing page without login)
// Protected: POST, PUT, DELETE, PATCH (admin only)
// ============================================================

const router = require('express').Router();
const ctrl   = require('../controllers/product.controller');
const { protect, requireAdmin } = require('../middleware/auth.middleware');

// ── PUBLIC routes (no auth needed) ───────────────────────────
router.get('/',    ctrl.getAllProducts);
router.get('/:id', ctrl.getProduct);

// ── PROTECTED routes (admin only) ────────────────────────────
router.post('/',                protect, requireAdmin, ctrl.createProduct);
router.post('/import-external', protect, requireAdmin, ctrl.importFromExternal);
router.put('/:id',              protect, requireAdmin, ctrl.updateProduct);
router.delete('/:id',           protect, requireAdmin, ctrl.deleteProduct);
router.patch('/:id/stock',      protect, requireAdmin, ctrl.updateStock);

module.exports = router;
