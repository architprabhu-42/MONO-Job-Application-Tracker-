// MONO API entry point for a normal Node server (local development, Render):
// React (client) → Express (app.js) → MongoDB.
import { isProduction } from './config/env.js'; // must be first: loads .env
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Single-service deployment: in production, if the React app has been built
// (client/dist), Express serves it and falls back to index.html for SPA routes.
const clientDist = path.resolve(import.meta.dirname, '..', 'client', 'dist');
if (isProduction && fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

try {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`MONO API listening on http://localhost:${PORT}`));
} catch (err) {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
}
