import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import pageRoutes from './routes/page.routes';
import customComponentRoutes from './routes/customComponent.routes';
import assetRoutes from './routes/asset.routes';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGIN doit être défini en production.');
}
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true
}));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/custom-components', customComponentRoutes);
app.use('/api/assets', assetRoutes);

export default app;
