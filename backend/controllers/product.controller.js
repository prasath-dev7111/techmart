// ============================================================
// controllers/product.controller.js
// CRUD + inventory update + import from FakeStore API (3rd party)
// ============================================================

const axios    = require('axios');
const Product  = require('../models/Product');
const Category = require('../models/Category');

// ── GET /api/products ────────────────────────────────────────
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, stockStatus, isFeatured, isActive, page = 1, limit = 20 } = req.query;
    // Allow public access to active products; admin can see all
    const filter = {};
    if (isActive !== 'false') filter.isActive = true; // default: active only

    if (category)              filter.category = category;
    if (search)                filter.name = { $regex: search, $options: 'i' };
    if (isFeatured === 'true') filter.isFeatured = true;
    if (stockStatus === 'low') filter.$expr = { $lte: ['$stock', '$lowStockAlert'] };
    if (stockStatus === 'out') filter.stock = 0;

    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name icon')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), data: products });
  } catch (err) { next(err); }
};

// ── GET /api/products/:id ─────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── POST /api/products ────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── PUT /api/products/:id ─────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── DELETE /api/products/:id (soft delete) ───────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Product removed.' });
  } catch (err) { next(err); }
};

// ── PATCH /api/products/:id/stock ────────────────────────────
// Update only the stock quantity (inventory adjustment)
exports.updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id, { stock }, { new: true }
    );
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// ── POST /api/products/import-external ───────────────────────
// Fetch products from FakeStore API and save to DB (3rd party API demo)
exports.importFromExternal = async (req, res, next) => {
  try {
    const response = await axios.get(`${process.env.FAKESTORE_API}/products`);
    const externalProducts = response.data;

    // Find or create a default category for imported items
    let defaultCat = await Category.findOne({ name: 'Imported' });
    if (!defaultCat) {
      defaultCat = await Category.create({ name: 'Imported', description: 'From FakeStore API' });
    }

    let imported = 0;
    for (const item of externalProducts) {
      const exists = await Product.findOne({ externalId: String(item.id) });
      if (!exists) {
        await Product.create({
          name:        item.title,
          description: item.description,
          price:       item.price,
          image:       item.image,
          category:    defaultCat._id,
          stock:       Math.floor(Math.random() * 100) + 10,
          externalId:  String(item.id),
          source:      'fakestore'
        });
        imported++;
      }
    }

    res.json({ success: true, message: `Imported ${imported} new products.` });
  } catch (err) { next(err); }
};
