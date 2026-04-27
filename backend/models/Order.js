// ============================================================
// models/Order.js – Order Schema
// Tracks the full lifecycle: Placed → Processing → Shipped → Delivered
// ============================================================

const mongoose = require('mongoose');

// Each product line in an order
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId,  ref: 'Product',required: false},
  name:     { type: String, required: true },   // Snapshot of product name at order time
  price:    { type: Number, required: true },   // Snapshot of price at order time
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // Auto-generated in controller before save
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  items: [orderItemSchema],  // Array of products ordered

  // ── Financial ─────────────────────────────────────────────
  subtotal:       { type: Number, required: true },
  tax:            { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  totalAmount:    { type: Number, required: true },

  // ── Payment ───────────────────────────────────────────────
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'COD'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },

  // ── Order Lifecycle Status ────────────────────────────────
  status: {
    type: String,
    enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },

  // ── Delivery ─────────────────────────────────────────────
  shippingAddress: {
    street:  String,
    city:    String,
    state:   String,
    zip:     String,
    country: { type: String, default: 'India' }
  },
  trackingNumber: { type: String, default: '' },
  deliveredAt:    { type: Date, default: null },

  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
