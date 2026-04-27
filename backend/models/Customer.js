// ============================================================
// models/Customer.js
// ============================================================
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  city:  { type: String, default: '' },
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    zip:     { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  totalOrders: { type: Number, default: 0 },
  totalSpent:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  notes:       { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
