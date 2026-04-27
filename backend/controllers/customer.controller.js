// ============================================================
// controllers/customer.controller.js – Customer CRUD
// ============================================================

const Customer = require('../models/Customer');

exports.getAll = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [customers, total] = await Promise.all([
      Customer.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      Customer.countDocuments(filter)
    ]);
    res.json({ success: true, total, data: customers });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Customer removed.' });
  } catch (err) { next(err); }
};
