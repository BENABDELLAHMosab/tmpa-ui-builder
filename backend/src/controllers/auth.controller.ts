import { Request, Response } from 'express';
import { login, createDeveloper, getDevelopers, updateDeveloperStatus, deleteDeveloper } from '../services/auth.service';

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
    if (error.code === 'ACCOUNT_SUSPENDED') {
      res.status(403).json({
        code: 'ACCOUNT_SUSPENDED',
        error: error.message || 'Votre compte est suspendu. Contactez l’administrateur.'
      });
      return;
    }
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

export const getDevelopersController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const developers = await getDevelopers();
    res.status(200).json(developers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch developers' });
  }
};

export const updateDeveloperStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { accountStatus } = req.body;

    const updatedDeveloper = await updateDeveloperStatus(userId, accountStatus);
    res.status(200).json(updatedDeveloper);
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message || 'Failed to update developer status' });
  }
};

export const deleteDeveloperController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    await deleteDeveloper(userId);
    res.status(200).json({ message: 'Developer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'DEVELOPER_HAS_DEPENDENCIES') {
      res.status(409).json({ code: error.code, error: error.message });
      return;
    }
    if (error.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message || 'Failed to delete developer' });
  }
};

