import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { authRoutes } from './server/routes/auth.js';
import { listingRoutes } from './server/routes/listings.js';
import { seedDatabase } from './server/seed.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  // NOTE: This uses process.env.MONGODB_URI which should be set to your Railway MongoDB Private or Public URL
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || mongoUri === 'your-mongodb-uri') {
      console.warn('⚠️ MONGODB_URI is not defined in environment variables. Please set it to your Railway MongoDB URI.');
    } else {
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB (Railway deployment)');
      
      // Run seed logic
      await seedDatabase();
    }
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
