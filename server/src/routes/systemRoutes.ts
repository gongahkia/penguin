import express from 'express';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import os from 'os';

const router = express.Router();

// Get system information
router.get('/info', asyncHandler(async (req: AuthRequest, res) => {
  const systemInfo = {
    os: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length
    },
    process: {
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      pid: process.pid
    },
    server: {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
  };

  res.json(systemInfo);
}));

// Get server stats
router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const stats = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    loadAverage: os.loadavg(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem()
  };

  res.json(stats);
}));

export default router;