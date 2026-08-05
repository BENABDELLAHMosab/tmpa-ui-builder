import { Request, Response } from 'express';
import { login, createDeveloper } from '../services/auth.service';

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

export const createDeveloperController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const user = await createDeveloper({
      fullName,
      email,
      password
    });

    res.status(201).json({
      message: 'Developer account created successfully',
      user
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message || 'Failed to create developer account' });
  }
};
