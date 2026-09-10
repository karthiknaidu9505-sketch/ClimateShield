import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();

// ── Fix 1: Robust FRONTEND_DIST path resolution ────────────────
// Correctly locates frontend/dist whether backend is started from
// the project root or directly from the backend directory.
const rootDist = path.resolve(process.cwd(), 'frontend', 'dist');
const parentDist = path.resolve(process.cwd(), '..', 'frontend', 'dist');
const FRONTEND_DIST = fs.existsSync(rootDist) ? rootDist : parentDist;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin.includes(',') ? corsOrigin.split(',').map(s => s.trim()) : corsOrigin,
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
      // Fix 3: Relative /api/health URL rather than hardcoded localhost
      res.status(200).json({
        message: 'ClimateShield API is running. Build the frontend with: npm run build --prefix frontend',
        api: '/api/health'
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
