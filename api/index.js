// Vercel serverless entry point. Every /api/* request is rewritten here
// (see vercel.json) and handled by the same Express app used locally.
import app from '../server/app.js';
import { connectDB } from '../server/config/db.js';

// Reuse one MongoDB connection across invocations of a warm function.
let connection;

export default async function handler(req, res) {
  try {
    connection ??= connectDB(process.env.MONGODB_URI);
    await connection;
  } catch (err) {
    connection = undefined; // retry on the next request
    console.error('Failed to connect to MongoDB:', err.message);
    return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again shortly.' });
  }
  return app(req, res);
}
