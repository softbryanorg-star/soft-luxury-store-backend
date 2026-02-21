import jwt from 'jsonwebtoken';

// protect middleware: verifies JWT and attaches minimal user info to req.user
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach both id and _id for backwards compatibility, and role
    req.user = { id: payload.id, _id: payload.id, role: payload.role };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// adminOnly middleware
const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

export default protect;
export { adminOnly };
