import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { clearAuthCookie, setAuthCookie } from '../middleware/auth.js';

const SALT_ROUNDS = 10;

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new AppError('An account with this email already exists.', 409, {
      email: 'An account with this email already exists',
    });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  setAuthCookie(res, user._id);
  res.status(201).json({ success: true, message: 'Account created.', data: { user } });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // Same message for unknown email and wrong password, so accounts can't be guessed.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password.', 401);
  }

  setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Logged in.', data: { user } });
}

// POST /api/auth/logout
export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out.' });
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

// PUT /api/auth/me — update display name and email
export async function updateMe(req, res) {
  const { name, email } = req.body;

  if (email !== req.user.email && (await User.exists({ email, _id: { $ne: req.user._id } }))) {
    throw new AppError('This email is already in use.', 409, { email: 'This email is already in use' });
  }

  req.user.name = name;
  req.user.email = email;
  await req.user.save();
  res.json({ success: true, message: 'Profile updated.', data: { user: req.user } });
}
