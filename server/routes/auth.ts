import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, companyName: user.companyName, email: user.email, industryType: user.industryType, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Not implemented' });
});

export const authRoutes = router;
