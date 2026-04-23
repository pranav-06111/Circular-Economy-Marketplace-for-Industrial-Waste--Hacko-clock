import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Using .ts extension in imports might be tricky for Vercel's ts-node, but since the project is type: module 
// and uses .js imports, let's keep them as .js which match the existing server.ts
import { authRoutes } from '../server/routes/auth.js';
import { listingRoutes } from '../server/routes/listings.js';
import { paymentRoutes } from '../server/routes/payment.js';
import { orderRoutes } from '../server/routes/orders.js';

const app = express();

app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri);
  isConnected = true;
  console.log('Connected to MongoDB');
}

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV, vercel: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

export default app;
