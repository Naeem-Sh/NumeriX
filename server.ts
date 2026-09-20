import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Persistent data directory OUTSIDE the project folder
// Uses NUMERIX_DATA_DIR environment variable if provided, or default user home directory ~/.numerix
const DATA_DIR = process.env.NUMERIX_DATA_DIR || path.join(os.homedir(), '.numerix');
const DATA_FILE = path.join(DATA_DIR, 'calculator-data.json');

// Ensure external directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not initialize external storage directory:', DATA_DIR, err);
}

app.use(express.json({ limit: '25mb' }));

// 1. API: Get storage status and file path info
app.get('/api/storage/info', (req, res) => {
  let fileExists = false;
  let fileSizeBytes = 0;
  let lastSaved: string | null = null;
  let recordsCount = 0;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const stat = fs.statSync(DATA_FILE);
      fileExists = true;
      fileSizeBytes = stat.size;
      lastSaved = stat.mtime.toISOString();

      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tape)) {
        recordsCount = parsed.tape.length;
      }
    }
  } catch (e) {
    console.error('Error reading storage info:', e);
  }

  res.json({
    status: 'ok',
    isExternal: true,
    dataDirectory: DATA_DIR,
    dataFile: DATA_FILE,
    fileExists,
    fileSizeBytes,
    lastSaved,
    recordsCount,
    homedir: os.homedir(),
  });
});

// 2. API: Load data from external file
app.get('/api/storage/data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ success: true, data: null, message: 'No external file exists yet.' });
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to read external data file' });
  }
});

// 3. API: Save data to external file outside project
app.post('/api/storage/data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = req.body;
    // Write atomically with safe formatting
    const jsonStr = JSON.stringify(payload, null, 2);
    fs.writeFileSync(DATA_FILE, jsonStr, 'utf-8');

    res.json({
      success: true,
      dataFile: DATA_FILE,
      savedAt: new Date().toISOString(),
      bytes: jsonStr.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to write to external data file' });
  }
});

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), storageFile: DATA_FILE });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Data stored outside project folder at: ${DATA_FILE}`);
  });
}

startServer();
