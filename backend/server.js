// ============================================================
// server.js – TechMart Backend Entry Point
// Boots Express, connects to MongoDB, registers all routes
// ============================================================

const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

// Load env vars from .env file
dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors());                          // Allow cross-origin requests (frontend ↔ backend)
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/products',   require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/orders',     require('./routes/order.routes'));
app.use('/api/customers',  require('./routes/customer.routes'));
app.use('/api/reports',    require('./routes/report.routes'));

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 TechMart API is running!', status: 'OK' });
});

// ── Global Error Handler ─────────────────────────────────────
app.use(require('./middleware/error.middleware'));

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ TechMart server running on http://localhost:${PORT}`);
});
