import crypto from 'crypto';
import axios from 'axios';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

export const initiatePaystack = async (req, res) => {
  try {
    const { orderId, email, amount: amountOverride } = req.body;
    let amount;
    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      amount = order.totalAmount;
    } else {
      amount = amountOverride;
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const reference = `ord_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    const payload = {
      email: email || 'customer@example.com',
      amount: Math.round(amount * 100),
      reference,
      callback_url: (process.env.FRONTEND_ORIGIN || '') + '/payment-success'
    };

    const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    if (order) {
      order.paymentProvider = 'paystack';
      order.paymentProviderRef = reference;
      await order.save();
    }

    res.json({ authorization_url: response.data.data.authorization_url, access_code: response.data.data.access_code, reference });
  } catch (err) {
    console.error('Paystack initiate error', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');
    if (signature !== hash) {
      console.warn('Invalid webhook signature');
      return res.status(401).send('invalid signature');
    }

    const event = req.body;
    if (event && event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;
      const amount = data.amount / 100;
      const order = await Order.findOne({ paymentProviderRef: reference });
      if (order) {
        order.status = 'paid';
        await order.save();
        await Payment.create({ order: order._id, provider: 'paystack', providerPaymentId: data.id, status: 'success', amount, meta: data });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

export default { initiatePaystack, paystackWebhook };
