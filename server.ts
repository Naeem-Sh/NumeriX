import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Ensure socket binds to a valid network interface (defaults to 0.0.0.0), ignoring arbitrary hostname labels
const rawHost = process.env.BIND_HOST || process.env.HOST || '0.0.0.0';
const HOST = /^(?:\d{1,3}\.){3}\d{1,3}$|^::$/.test(rawHost) || rawHost === 'localhost' ? rawHost : '0.0.0.0';

// Mandatory In-Code Fallbacks (Zero-Stop Runtime)
const DATA_DIR = process.env.DATA_DIR || '/app/data';
const TZ = process.env.TZ || 'Asia/Tehran';
const RESET_ADMIN_PASSWORD = process.env.RESET_ADMIN_PASSWORD || 'false';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-production-jwt-secret-replace-me';
const INITIAL_ADMIN_USERNAME = process.env.INITIAL_ADMIN_USERNAME || 'admin';
const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || '123';

// Storage Path Derivation (Strict structured resolution under DATA_DIR)
const STORAGE_PATHS = {
  root: DATA_DIR,
  database: path.join(DATA_DIR, 'database.json'),
  visits: path.join(DATA_DIR, 'visits.json'),
  uploads: path.join(DATA_DIR, 'uploads'),
  backups: path.join(DATA_DIR, 'backups'),
};

// Initialize Storage Directory Layout (Empty Directory Tolerance)
function initializeStorage(): void {
  try {
    // 1. Ensure required subdirectories exist
    if (!fs.existsSync(STORAGE_PATHS.uploads)) {
      fs.mkdirSync(STORAGE_PATHS.uploads, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_PATHS.backups)) {
      fs.mkdirSync(STORAGE_PATHS.backups, { recursive: true });
    }

    // 2. Starter schema for database.json if not present
    if (!fs.existsSync(STORAGE_PATHS.database)) {
      const initialDatabase = {
        app: 'NumeriX Financial Calculator',
        version: '2.3.2',
        initializedAt: new Date().toISOString(),
        settings: {},
        records: [],
      };
      fs.writeFileSync(STORAGE_PATHS.database, JSON.stringify(initialDatabase, null, 2), 'utf-8');
    }

    // 3. Starter schema for visits.json if not present
    if (!fs.existsSync(STORAGE_PATHS.visits)) {
      const initialVisits = {
        totalVisits: 0,
        lastVisit: null,
      };
      fs.writeFileSync(STORAGE_PATHS.visits, JSON.stringify(initialVisits, null, 2), 'utf-8');
    }

    console.log(`[NumeriX] Persistent storage initialized at: ${DATA_DIR}`);
  } catch (err) {
    console.error(`[NumeriX] Warning: Could not initialize storage directory ${DATA_DIR}:`, (err as Error).message);
  }
}

initializeStorage();

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
  const isStorageReady = fs.existsSync(STORAGE_PATHS.database) && fs.existsSync(STORAGE_PATHS.visits);
  res.status(200).json({
    status: 'healthy',
    app: 'NumeriX Financial Calculator',
    version: '2.3.2',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    timezone: TZ,
    storage: {
      dataDir: DATA_DIR,
      ready: isStorageReady,
    },
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
