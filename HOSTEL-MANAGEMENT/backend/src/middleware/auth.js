import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function requireAuth(roles = []) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      const user = await User.findById(payload.userId).lean();
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      if (roles.length && !roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

export function signToken(user) {
  const payload = { userId: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}


