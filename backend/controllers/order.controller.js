// ============================================================
// controllers/order.controller.js
// Handles order creation (admin + user checkout), status updates
// ============================================================

const Order    = require('../models/Order');
const Product  = require('../models/Product');
const Customer = require('../models/Customer');

const generateOrderNumber = () => {
  return `TM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// ── GET /api/orders ───────────────────────────────────────────
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Regular users only see their own orders (matched by email via customer)
    if (req.user.role === 'user') {
      const customer = await Customer.findOne({ email: req.user.email });
      if (customer) filter.customer = customer._id;
      else return res.json({ success: true, total: 0, page: 1, data: [] });
    }

    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({ success: true, total, page: Number(page), data: orders });
  } catch (err) { next(err); }
};

// ── GET /api/orders/:id ───────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ── POST /api/orders ──────────────────────────────────────────
// Supports two modes:
//   Admin mode:  { customerId, items:[{productId, quantity}], paymentMethod, shippingAddress }
//   User checkout: { items:[{product, name, price, quantity}], subtotal, tax, shippingCharge,
//                    totalAmount, paymentMethod, paymentStatus, shippingAddress }
exports.createOrder = async (req, res, next) => {
  try {
    const body = req.body;
    let orderItems = [];
    let subtotal   = body.subtotal   || 0;
    let tax        = body.tax        || 0;
    let shipping   = body.shippingCharge ?? (subtotal > 500 ? 0 : 50);
    let total      = body.totalAmount || (subtotal + tax + shipping);
    let customerId = body.customerId || null;

    // ── Admin-style order (products looked up from DB) ──
    if (body.customerId && body.items && body.items[0]?.productId) {
      subtotal = 0;
      for (const item of body.items) {
        const product = await Product.findById(item.productId);
        if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
        if (product.stock < item.quantity)
          return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
        subtotal += product.price * item.quantity;
        orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity });
        product.stock -= item.quantity;
        await product.save();
      }
      tax = parseFloat((subtotal * 0.18).toFixed(2));
      shipping = subtotal > 500 ? 0 : 50;
      total    = subtotal + tax + shipping;

    } else {
      // ── User checkout (items already have price/name from cart) ──
      for (const item of (body.items || [])) {
        const pid = item.product || item.productId;
        if (pid && pid.length === 24) {

        const product = await Product.findById(pid);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found"
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `${product.name} has only ${product.stock} stock left`
          });
        }

        product.stock -= item.quantity;
        await product.save();

        orderItems.push({
          product: pid,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });

      } else {
          // External / fallback product ID (no DB record needed)
          orderItems.push({ name: item.name, price: item.price, quantity: item.quantity });
        }
      }

      // Find or create customer record from logged-in user
      if (req.user && req.user.email) {
        let cust = await Customer.findOne({ email: req.user.email });
        if (!cust) {
          cust = await Customer.create({
            name: req.user.name, email: req.user.email,
            phone: body.shippingAddress?.phone || '',
            address: body.shippingAddress || {},
            isActive: true
          });
        } else {
          // Update address if provided
          if (body.shippingAddress) {
            cust.address = body.shippingAddress;
            await cust.save();
          }
        }
        customerId = cust._id;
        await Customer.findByIdAndUpdate(customerId, { $inc: { totalOrders: 1, totalSpent: total } });
      }
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer:        customerId,
      items:           orderItems,
      subtotal, tax,
      shippingCharge:  shipping,
      totalAmount:     total,
      paymentMethod:   body.paymentMethod  || 'UPI',
      paymentStatus:   body.paymentStatus  || 'Paid',
      status:          'Placed',
      shippingAddress: body.shippingAddress || {},
      notes:           body.notes || ''
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ── PATCH /api/orders/:id/status ─────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const update = { status };
    if (trackingNumber)      update.trackingNumber = trackingNumber;
    if (status === 'Delivered') update.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ── PATCH /api/orders/:id/payment ────────────────────────────
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { paymentStatus: req.body.paymentStatus }, { new: true }
    );
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};
