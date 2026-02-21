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
server.use(cors());

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

//✅ 1. Enable CORS before everything else
 const allowedOrigins = [
  "http://localhost:5173",
   "https://soft-luxury-store.vercel.app/",
];

server.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); 
