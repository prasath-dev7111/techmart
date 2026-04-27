// ============================================================
// middleware/auth.middleware.js — JWT Verification + Role Guards
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach req.user
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised. No token.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied for your role.' });
  }
  next();
};

// Admin/manager/staff only — blocks regular users
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role === 'user') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

module.exports = { protect, restrictTo, requireAdmin };
