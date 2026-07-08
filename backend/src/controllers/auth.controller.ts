import { Request, Response } from 'express';
import { login } from '../services/auth.service';

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
};

export const meController = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ user: req.user });
};
