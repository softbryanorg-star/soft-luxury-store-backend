import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, logout } from '../controllers/authController.js';

const router = express.Router();

// basic rate limiter for auth endpoints to prevent brute-force attempts
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // limit each IP to 10 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many requests, please try again later.' }
});

router.post('/register', authLimiter, [
	body('email').isEmail().withMessage('Please provide a valid email address'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);


router.post('/login', authLimiter, [
	body('email').isEmail().withMessage('Please provide a valid email address'),
	body('password').exists().withMessage('Password is required')
], login);

// refresh token endpoint (reads httpOnly cookie)
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
