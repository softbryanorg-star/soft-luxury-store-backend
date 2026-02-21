import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart empty' });
  try {
    const built = await Promise.all(items.map(async it => {
      const product = await Product.findById(it.productId).lean();
      const snapshot = product ? { name: product.name, price: product.price, images: product.images } : it.productSnapshot;
      return { productId: it.productId, productSnapshot: snapshot, quantity: it.quantity, unitPrice: snapshot?.price ?? it.unitPrice };
    }));
    const total = built.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    const userId = req.user ? req.user._id : null;
    const order = new Order({ user: userId, items: built, totalAmount: total, shippingAddress, currency: 'USD', status: 'pending' });
    await order.save();
    res.json({ orderId: order._id, totalAmount: order.totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email firstName');
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export default { createOrder, getOrderById };
