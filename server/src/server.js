import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  console.log('🌱 Starting EcoTrack Server...');
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`🚀 EcoTrack API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`   Health check endpoint: http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down EcoTrack gracefully...`);
    if (server) {
      server.close(async () => {
        console.log('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
