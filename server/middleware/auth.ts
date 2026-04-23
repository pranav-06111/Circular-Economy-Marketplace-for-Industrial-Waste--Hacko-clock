import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { 
    userId: string;
    role?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || "supersecretjwtkey";
    const decoded = jwt.verify(token, secret) as { userId: string, role?: string };
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error('JWT Verification Failed:', err.message, 'Secret present:', !!process.env.JWT_SECRET);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ error: 'User role not found' });
      return;
    }
    
    if (roles.includes(req.user.role) || req.user.role === 'both') {
      next();
    } else {
      res.status(403).json({ error: `Access Denied. Requires role: ${roles.join(' or ')}` });
    }
  };
};
