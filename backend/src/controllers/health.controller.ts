import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const getHealthStatus = (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    service: 'tmpa-ui-builder-api',
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      name: 'tmpa_ui_builder'
    }
  });
};
