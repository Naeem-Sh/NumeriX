import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Ensure socket binds to a valid network interface (defaults to 0.0.0.0), ignoring arbitrary hostname labels
const rawHost = process.env.BIND_HOST || process.env.HOST || '0.0.0.0';
const HOST = /^(?:\d{1,3}\.){3}\d{1,3}$|^::$/.test(rawHost) || rawHost === 'localhost' ? rawHost : '0.0.0.0';

// Determine dist directory path reliably in both development and bundled production
const distDir = fs.existsSync(path.resolve(process.cwd(), 'dist'))
  ? path.resolve(process.cwd(), 'dist')
  : path.resolve(__dirname, 'dist');

// Enable reverse proxy support (X-Forwarded-For, X-Forwarded-Proto)
app.set('trust proxy', true);

// Standard Security & Performance Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Dedicated Air-Gapped Healthcheck Endpoints
app.get(['/health', '/healthz'], (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    app: 'NumeriX Financial Calculator',
    version: '2.3.1',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Serve static assets with cache headers
if (fs.existsSync(distDir)) {
  // Long-term caching for immutable hashed assets
  app.use(
    '/assets',
    express.static(path.join(distDir, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  );

  // General static file serving (favicons, manifest, etc.)
  app.use(
    express.static(distDir, {
      maxAge: '1h',
      index: false,
    })
  );

  // Single-Page Application (SPA) fallback - serve index.html for any unhandled GET route
  app.get('*', (_req, res) => {
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application bundle not found. Please build the frontend first.');
    }
  });
} else {
  app.get('*', (_req, res) => {
    res.status(503).send('Application build in progress or dist directory missing.');
  });
}

// Start HTTP Server
const server = app.listen(PORT, HOST, () => {
  console.log(`[NumeriX] Production server listening on http://${HOST}:${PORT}`);
  console.log(`[NumeriX] Air-gapped runtime ready. Healthcheck available at /healthz`);
});

// POSIX Signal Handling for Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`[NumeriX] Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('[NumeriX] HTTP server terminated cleanly.');
    process.exit(0);
  });

  // Force shutdown if connections do not drain in 5 seconds
  setTimeout(() => {
    console.error('[NumeriX] Forced termination due to timeout.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
