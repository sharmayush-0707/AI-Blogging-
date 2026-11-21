import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import postsRouter from './routes/posts.js';
import aiRouter from './routes/ai.js';
import seoRouter from './routes/seo.js';
import analyticsRouter from './routes/analytics.js';
import subscriptionsRouter from './routes/subscriptions.js';
import ssrRouter from './routes/ssr.js';
import { db } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/ssr')) {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/posts', postsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/seo', seoRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/subscriptions', subscriptionsRouter);

// Server-Side Rendering (SSR) & Crawlers Feeds
app.use('/ssr', ssrRouter);
app.get('/sitemap.xml', (req, res, next) => {
  req.url = '/sitemap.xml';
  ssrRouter(req, res, next);
});
app.get('/rss.xml', (req, res, next) => {
  req.url = '/rss.xml';
  ssrRouter(req, res, next);
});
app.get('/robots.txt', (req, res, next) => {
  req.url = '/robots.txt';
  ssrRouter(req, res, next);
});

// Health check
app.get('/api/health', (req, res) => {
  const stats = db.getPlatformStats();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: stats.isMongoConnected ? 'MongoDB (Mongoose)' : 'Local JSON Store (Embedded DB)',
    postsCount: stats.totalPosts,
    subscribersCount: stats.activeSubscribers
  });
});

// Serve client dist in production or unified port mode
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  
  // Single-page application fallback for unmatched non-API/non-SSR GET requests
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/ssr') ||
      req.originalUrl === '/sitemap.xml' ||
      req.originalUrl === '/rss.xml' ||
      req.originalUrl === '/robots.txt'
    ) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AI-Powered Blogging Platform Server Running!`);
  console.log(`🌐 Full Application:     http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:        http://localhost:${PORT}/api/posts`);
  console.log(`🧠 AI Suggestions:      http://localhost:${PORT}/api/ai/suggest`);
  console.log(`🔍 SEO Auditor:          http://localhost:${PORT}/api/seo/audit`);
  console.log(`📈 Analytics:            http://localhost:${PORT}/api/analytics/overview`);
  console.log(`💳 Subscriptions:        http://localhost:${PORT}/api/subscriptions/plans`);
  console.log(`⚡ Server-Side Render:   http://localhost:${PORT}/ssr/post/:slug`);
  console.log(`🗺️ XML Sitemap:          http://localhost:${PORT}/sitemap.xml`);
  console.log(`📰 RSS Feed:             http://localhost:${PORT}/rss.xml`);
  console.log(`======================================================\n`);
});
