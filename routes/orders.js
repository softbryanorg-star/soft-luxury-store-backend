import express from 'express';
import auth from '../middleware/auth.js';
import { createOrder, getOrderById } from '../controllers/ordersController.js';

const router = express.Router();

// create order (allows guest checkout)
router.post('/', createOrder);

// get order by id (owner or admin)
router.get('/:id', auth, getOrderById);

export default router;
