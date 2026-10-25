import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

// CORS configuration (supports comma-separated origins, localhost, and *.onrender.com)
const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Allow if origin is in allowed list or is a Render service domain
      if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      // Permissive fallback
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// General rate limiter on API endpoints (disabled in test)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

// Resource Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);

// Static client hosting support (for unified fullstack Render deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(clientDistPath);

if (process.env.NODE_ENV === 'production' && hasClientBuild) {
  // Serve built static assets from React client
  app.use(express.static(clientDistPath));

  // SPA fallback for frontend client routing (non-API and non-uploads)
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root informational endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to EcoTrack API — Smart Waste Management & Recycling Platform',
      documentation: '/api/health',
      version: '1.0.0'
    });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
