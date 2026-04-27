// ============================================================
// routes/customer.routes.js
// ============================================================

const router = require("express").Router();
const ctrl = require("../controllers/customer.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

router.use(protect);
router.use(requireAdmin);

router.get("/", ctrl.getAll);
router.post("/", ctrl.create);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.delete);

module.exports = router;