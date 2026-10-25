import express from 'express';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'EcoTrack API Server is running smoothly',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected
    }
  });
});

export default router;
