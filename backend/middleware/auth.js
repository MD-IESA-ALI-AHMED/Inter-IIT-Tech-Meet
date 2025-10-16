import jwt from 'jsonwebtoken';
import TokenBlacklist from '../models/TokenBlacklist.js';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Bad token' });
  const token = parts[1];
  try {
    // check blacklist
    const found = await TokenBlacklist.findOne({ token });
    if (found) return res.status(401).json({ message: 'Token revoked' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
