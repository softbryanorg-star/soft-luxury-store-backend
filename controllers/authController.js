import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import crypto from 'crypto';

const createAccessToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
const createRefreshTokenString = () => crypto.randomBytes(64).toString('hex');

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { firstName, lastName, email, password, phoneNumber, address } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const role = (email === process.env.ADMIN_EMAIL) ? 'admin' : 'user';
    const user = new User({ firstName, lastName, email, passwordHash: hash, phoneNumber, address, role });
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshString = createRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await RefreshToken.create({ user: user._id, token: refreshString, expiresAt });

    // set refresh cookie for entire site so logout/refresh endpoints receive it
    res.cookie('refreshToken', refreshString, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
    res.json({ token: accessToken, user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const accessToken = createAccessToken(user);
    const refreshString = createRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await RefreshToken.create({ user: user._id, token: refreshString, expiresAt });

    // set refresh cookie for entire site so logout/refresh endpoints receive it
    res.cookie('refreshToken', refreshString, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
    res.json({ token: accessToken, user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
    const stored = await RefreshToken.findOne({ token: refreshToken }).populate('user');
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });
    if (stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    const accessToken = createAccessToken(stored.user);
    res.json({ token: accessToken, user: { id: stored.user._id, email: stored.user.email, firstName: stored.user.firstName, role: stored.user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
// end of file
