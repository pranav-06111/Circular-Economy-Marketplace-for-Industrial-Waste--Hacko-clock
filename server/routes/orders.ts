import express, { Response } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth.js';
import { Match } from '../models/Match.js';
import { WasteListing } from '../models/WasteListing.js';

const router = express.Router();

// GET /api/orders/buyer - Fetch orders where the user is the buyer
router.get('/buyer', authenticate, authorizeRole(['buyer', 'both']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matches = await Match.find({ buyer: req.user!.userId })
      .populate({
        path: 'listing',
        populate: {
          path: 'seller',
          select: 'companyName location name'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Fetch buyer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch buyer orders' });
  }
});

// GET /api/orders/seller - Fetch orders for listings owned by the seller
router.get('/seller', authenticate, authorizeRole(['seller', 'both']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Find all listings owned by the seller
    const listings = await WasteListing.find({ seller: req.user!.userId }).select('_id');
    const listingIds = listings.map(l => l._id);

    // 2. Find matches for those listings
    const matches = await Match.find({ listing: { $in: listingIds } })
      .populate('listing')
      .populate('buyer', 'companyName location name')
      .sort({ createdAt: -1 });

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Fetch seller orders error:', error);
    res.status(500).json({ error: 'Failed to fetch seller orders' });
  }
});

export const orderRoutes = router;
