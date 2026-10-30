// Loads environment variables from server/.env before anything else runs.
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(import.meta.dirname, '..', '.env'), quiet: true });

const required = ['MONGODB_URI', 'SESSION_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      'Locally, copy server/.env.example to server/.env; on Vercel/Render, add them in the project settings.'
  );
}

export const isProduction = process.env.NODE_ENV === 'production';
