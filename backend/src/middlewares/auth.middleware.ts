import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Configuration du serveur invalide' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
      return;
    }

    const user = await User.findById(decoded.userId)
      .select('_id email role accountStatus')
      .lean();

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User no longer exists' });
      return;
    }

    const accountStatus = user.accountStatus || 'active';

    if (user.role === 'user-developer' && accountStatus === 'suspended') {
      res.status(403).json({
        code: 'ACCOUNT_SUSPENDED',
        error: 'Votre compte est suspendu. Contactez l’administrateur.'
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      accountStatus
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
};
