import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import apiRoutes from './routes/apiRoutes';
import { startSocialScheduler } from './services/schedulerService';
import { syncAllLiveChannels } from './services/liveOrganicSyncService';
import { syncLivePaidAds } from './services/adPublisherService';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static uploaded media files
app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'koh! Command Center & Factory API',
    time: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const start = async () => {
  await connectDB();
  
  // Start background auto-scheduler for scheduled social posts
  startSocialScheduler(30000);

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 koh! Backend API running at http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📁 Media Uploads: http://localhost:${PORT}/uploads`);
    console.log(`====================================================`);

    // Initial background sync for active marketing channels (YouTube, Meta, Google Ads)
    setTimeout(async () => {
      try {
        console.log(`[Marketing Auto-Sync] Initializing live channel sync...`);
        await syncAllLiveChannels();
        await syncLivePaidAds();
        console.log(`[Marketing Auto-Sync] Live actual data synchronized successfully.`);
      } catch (syncErr: any) {
        console.warn(`[Marketing Auto-Sync Notice]:`, syncErr.message);
      }
    }, 2000);
  });
};

start();

