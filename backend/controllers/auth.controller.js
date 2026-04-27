// ============================================================
// controllers/auth.controller.js — Fixed auth with role safety
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── POST /api/auth/register ───────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow admin role if the correct admin secret header is provided
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'techmart_admin_2024';
    const providedSecret = req.headers['x-admin-secret'] || '';
    const adminRoles = ['admin', 'manager', 'staff'];

    let assignedRole = 'user'; // default safe role
    if (adminRoles.includes(role)) {
      if (providedSecret === ADMIN_SECRET) {
        assignedRole = role; // allow admin role
      } else {
        return res.status(403).json({ success: false, message: 'Admin secret key is invalid or missing.' });
      }
    }

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken(user._id);
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
