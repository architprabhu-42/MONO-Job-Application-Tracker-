import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { AUTH_COOKIE } from '../utils/constants.js';
import { isProduction } from '../config/env.js';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cookieOptions() {
  // "lax" works when the frontend and API share an origin (Vite proxy, Vercel
  // rewrite or Express serving the build). Use "none" for a separate API domain.
  const sameSite = process.env.COOKIE_SAMESITE || 'lax';
  return {
    httpOnly: true, // not readable from JavaScript
    secure: isProduction || sameSite === 'none',
    sameSite,
    path: '/',
  };
}

export function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: userId.toString() }, process.env.SESSION_SECRET, { expiresIn: '7d' });
  res.cookie(AUTH_COOKIE, token, { ...cookieOptions(), maxAge: TOKEN_TTL_MS });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
}

// Protects a route: verifies the cookie token and loads the user into req.user.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return next(new AppError('Please log in to continue.', 401));

  let payload;
  try {
    payload = jwt.verify(token, process.env.SESSION_SECRET);
  } catch {
    clearAuthCookie(res);
    return next(new AppError('Your session has expired. Please log in again.', 401));
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    clearAuthCookie(res);
    return next(new AppError('Account not found. Please log in again.', 401));
  }

  req.user = user;
  next();
}
