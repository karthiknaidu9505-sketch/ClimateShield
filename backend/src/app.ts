import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();

// Resolve frontend dist path — works in both tsx (dev) and tsc (prod) builds.
// backend/src/app.ts → go up 2 levels to project root → frontend/dist
const FRONTEND_DIST = path.resolve(process.cwd(), 'frontend', 'dist');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'ClimateShield - Urban Climate Risk & Resilience Platform',
    timestamp: new Date().toISOString()
  });
});

// REST API Routes
app.use('/api', apiRouter);

// ── Serve built React frontend (production) ──────────────────
// Must come AFTER all /api routes so API calls are not intercepted
app.use(express.static(FRONTEND_DIST));

// SPA catch-all: for any GET that didn't match /api/* or a static file,
// return index.html so React Router handles client-side navigation.
// This fixes the "refresh on /dashboard returns 404" issue.
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(FRONTEND_DIST, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Frontend not built yet — return a helpful message instead of crashing
      res.status(200).json({
        message: 'ClimateShield API is running. Build the frontend with: npm run build --prefix frontend',
        api: 'http://localhost:5000/api/health'
      });
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected operational error occurred.'
  });
});

export default app;
