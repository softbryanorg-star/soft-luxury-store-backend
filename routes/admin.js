import express from 'express';
import protect, { adminOnly } from '../middleware/auth.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);
router.get('/orders', protect, adminOnly, listOrders);

export default router;
