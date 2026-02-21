import express from 'express';
import { initiatePaystack, paystackWebhook } from '../controllers/paymentsController.js';

const router = express.Router();

router.post('/paystack/initiate', initiatePaystack);
router.post('/webhook/paystack', paystackWebhook);

export default router;
