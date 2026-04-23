import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import { authRoutes } from './server/routes/auth.js';
import { listingRoutes } from './server/routes/listings.js';
import { paymentRoutes } from './server/routes/payment.js';
import { orderRoutes } from './server/routes/orders.js';
import { seedDatabase } from './server/seed.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri || mongoUri === 'your-mongodb-uri') {
      console.warn('⚠️ MONGODB_URI is not defined. Initializing MongoDB Memory Server for development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('✨ MongoDB Memory Server started at:', mongoUri);
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Run seed logic
    await seedDatabase();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/orders', orderRoutes);

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
