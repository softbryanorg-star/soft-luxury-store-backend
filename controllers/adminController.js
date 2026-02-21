import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, images, stock, attributes, sku } = req.body;
    if (!name || typeof price !== 'number') return res.status(400).json({ error: 'Invalid payload' });
    const p = new Product({ name, description, price, images, stock, attributes, sku });
    await p.save();
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const upd = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!upd) return res.status(404).json({ error: 'Not found' });
    res.json(upd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const listOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200).populate('user', 'email firstName');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export default { requireAdmin, createProduct, updateProduct, deleteProduct, listOrders };
