import express from 'express';
import protect, { adminOnly } from '../middleware/auth.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders
} from '../controllers/adminController.js';
import { updateOrderStatus, exportOrdersCSV } from '../controllers/adminController.js';

const router = express.Router();

router.post('/products', protect, adminOnly, createProduct);
router.put('/products/:id', protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);
router.get('/orders', protect, adminOnly, listOrders);
router.put('/orders/:id/status', protect, adminOnly, updateOrderStatus);
router.get('/orders/export', protect, adminOnly, exportOrdersCSV);

export default router;
