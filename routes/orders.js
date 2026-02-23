import express from 'express';
import auth from '../middleware/auth.js';
import { createOrder, getOrderById } from '../controllers/ordersController.js';
import { trackOrder } from '../controllers/ordersController.js';

const router = express.Router();

// create order (allows guest checkout)
router.post('/', createOrder);

// get order by id (owner or admin)
router.get('/:id', auth, getOrderById);

// public track endpoint for guests: post { orderId, email }
router.post('/track', trackOrder);

export default router;
