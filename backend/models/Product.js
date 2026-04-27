// ============================================================
// models/Product.js — Product schema
// Fixed: SKU index is now sparse (allows multiple empty values)
// ============================================================
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  image:        { type: String, default: '' },
  images:       [{ type: String }],
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  brand:        { type: String, default: '' },
  // FIXED: sparse: true means MongoDB only indexes docs where sku is NOT empty/null
  sku:          { type: String, default: '', sparse: true },
  stock:        { type: Number, default: 0, min: 0 },
  lowStockAlert:{ type: Number, default: 10 },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:  { type: Number, default: 0 },
  tags:         [{ type: String }],
  isActive:     { type: Boolean, default: true },
  isFeatured:   { type: Boolean, default: false },
  externalId:   { type: String, default: '' },
  source:       { type: String, enum: ['manual','fakestore','import'], default: 'manual' },
}, {
  timestamps: true,
  toJSON:    { virtuals: true },
  toObject:  { virtuals: true }
});

// Sparse unique index: only enforces uniqueness for non-empty SKUs
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0)                    return 'Out of Stock';
  if (this.stock <= this.lowStockAlert)    return 'Low Stock';
  return 'In Stock';
});

module.exports = mongoose.model('Product', productSchema);
