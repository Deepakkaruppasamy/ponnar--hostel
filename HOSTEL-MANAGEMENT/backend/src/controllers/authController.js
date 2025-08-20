import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const { name, email, password, role, rollNumber } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: role === 'admin' ? 'admin' : 'student', rollNumber });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
}


