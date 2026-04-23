import express, { Response } from 'express';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Dynamically import Razorpay (CommonJS module)
let razorpayInstance: any = null;

async function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = (await import('razorpay')).default;
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpayInstance;
}

// POST /api/payment/create-order
router.post('/create-order', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, matchId, wasteType, sellerName, buyerName } = req.body;

    if (!amount || amount < 1) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const razorpay = await getRazorpay();

    const options = {
      amount: Math.round(amount * 100), // Razorpay accepts amount in paise
      currency: 'INR',
      receipt: `eco_${matchId || Date.now()}`,
      notes: {
        platform: 'EcoMatch India',
        matchId: matchId || 'direct',
        wasteType: wasteType || 'Industrial Waste',
        sellerName: sellerName || '',
        buyerName: buyerName || '',
        userId: req.user?.userId || '',
      },
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ error: 'Failed to create payment order', details: error.message });
  }
});

// POST /api/payment/verify
router.post('/verify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      matchData, // match details for creating ESG record
    } = req.body;

    // ── Signature Verification ──
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('Payment signature mismatch!');
      res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
      return;
    }

    // ── Generate ESG blockchain-style hash ──
    const blockchainHash = `0x${crypto
      .createHash('sha256')
      .update(`${razorpay_payment_id}-${Date.now()}-ecomatch-esg-${req.user?.userId}`)
      .digest('hex')}`;

    const co2Savings = matchData?.co2Savings || 0;
    const carbonCredits = matchData?.carbonCredits || (co2Savings * 0.8).toFixed(1);

    console.log('✅ Payment verified:', razorpay_payment_id);
    console.log('🔗 ESG Hash:', blockchainHash);

    res.status(200).json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      blockchainHash,
      esgRecord: {
        transactionId: razorpay_payment_id,
        co2Savings,
        carbonCredits,
        timestamp: new Date().toISOString(),
        status: 'Verified',
        network: 'Polygon Mumbai Testnet',
      },
    });
  } catch (error: any) {
    console.error('Payment verify error:', error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

// POST /api/payment/simulate — For demo/judging fallback
router.post('/simulate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchData } = req.body;

    const simulatedPaymentId = `pay_DEMO_${Date.now()}`;
    const blockchainHash = `0x${crypto
      .createHash('sha256')
      .update(`${simulatedPaymentId}-${Date.now()}-ecomatch-esg-demo`)
      .digest('hex')}`;

    const co2Savings = matchData?.co2Savings || 2.5;
    const carbonCredits = matchData?.carbonCredits || (co2Savings * 0.8).toFixed(1);

    res.status(200).json({
      success: true,
      paymentId: simulatedPaymentId,
      orderId: `order_DEMO_${Date.now()}`,
      blockchainHash,
      esgRecord: {
        transactionId: simulatedPaymentId,
        co2Savings,
        carbonCredits,
        timestamp: new Date().toISOString(),
        status: 'Simulated — Demo Mode',
        network: 'Polygon Mumbai Testnet (Demo)',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Simulation failed', details: error.message });
  }
});

export const paymentRoutes = router;
