import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import pageRoutes from './routes/page.routes';
import customComponentRoutes from './routes/customComponent.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/custom-components', customComponentRoutes);

export default app;
