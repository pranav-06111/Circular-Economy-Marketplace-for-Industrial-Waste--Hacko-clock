import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, companyName, email, password, location, industryType, phone, role } = req.body;
    
    const existingUser = await User.findOne({ email } as any);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      companyName,
      email,
      password: hashedPassword,
      location,
      industryType,
      phone,
      role: role || 'seller'
    });

    await user.save();
    
    // For MVP, auto-login after register
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, companyName: user.companyName, email: user.email, industryType: user.industryType, role: user.role } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email } as any);
    
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.authProvider === 'google' && !user.password) {
      res.status(400).json({ error: 'This account uses Google Sign-In. Please use the Google button.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Allow changing role on login to facilitate testing both sides
    const requestedRole = req.body.role;
    if (requestedRole && user.role !== requestedRole && requestedRole !== 'both') {
      user.role = requestedRole;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, companyName: user.companyName, email: user.email, industryType: user.industryType, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Google OAuth: verify ID token and create/find user
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Missing Google credential' });
      return;
    }

    // Verify the token with Google's tokeninfo endpoint
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    
    if (!googleRes.ok) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const payload = await googleRes.json() as any;

    // Log for debugging
    console.log('Google auth payload aud:', payload.aud);
    console.log('Google auth email:', payload.email);

    // Ensure we got a valid payload with email and sub
    if (!payload.email || !payload.sub) {
      res.status(401).json({ error: 'Invalid Google token payload' });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] } as any);

    if (user) {
      let updated = false;
      
      // Update role to what they selected on login to make testing easier
      if (role && user.role !== role && role !== 'both') {
        user.role = role;
        updated = true;
      }

      // Link Google account if user exists but hasn't linked Google yet
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        updated = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        updated = true;
      }
      
      if (updated) {
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name: name || email.split('@')[0],
        email,
        googleId,
        authProvider: 'google',
        role: role || 'seller',
        avatar: picture || '',
        companyName: '',
        location: '',
        phone: '',
        industryType: 'Manufacturing',
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        industryType: user.industryType,
        role: user.role,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Not implemented' });
});

export const authRoutes = router;

