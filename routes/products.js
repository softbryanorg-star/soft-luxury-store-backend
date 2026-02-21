import express from 'express';
import { listProducts, getProductById } from '../controllers/productsController.js';

const router = express.Router();

// list products (simple)
router.get('/', listProducts);
router.get('/:id', getProductById);

export default router;
