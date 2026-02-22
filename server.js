import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const server = express();
// configure CORS to allow frontend origin and credentials
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
server.use(cors({ origin: (origin, callback) => {
  if (!origin) return callback(null, true);
  if (origin === FRONTEND_ORIGIN) return callback(null, true);
  // allow localhost during development
  if (origin.startsWith('http://localhost')) return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
}, credentials: true }));

// connect db
connectDB().catch(err => { console.error(err); process.exit(1); });

// For Paystack webhook we need raw body; capture it on requests to /api/payments/webhook/paystack
server.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook/paystack') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      req.rawBody = data;
      try { req.body = JSON.parse(data); } catch (e) { req.body = {}; }
      next();
    });
  } else next();
});

server.use(express.json());
server.use(cookieParser());


server.use('/api/auth', authRoutes);
server.use('/api/products', productRoutes);
server.use('/api/admin', adminRoutes);
server.use('/api/orders', orderRoutes);
server.use('/api/payments', paymentRoutes);

server.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
// CORS configured above (do not use wildcard when credentials are included)
