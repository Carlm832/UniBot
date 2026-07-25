require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const searchService = require('./services/searchService');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Rate Limiting ─────────────────────────────────────────────────────────
// Simple in-memory rate limiter: max 30 requests per minute per IP
const rateLimit = (() => {
  const hits = new Map();
  const MAX_REQUESTS = 30;
  const WINDOW_MS = 60 * 1000; // 1 minute

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const entry = hits.get(ip) || { count: 0, start: now };

    if (now - entry.start > WINDOW_MS) {
      // Reset window
      entry.count = 1;
      entry.start = now;
    } else {
      entry.count += 1;
    }

    hits.set(ip, entry);

    if (entry.count > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment before trying again.',
      });
    }

    next();
  };
})();

// ─── CORS ──────────────────────────────────────────────────────────────────
// In production, set ALLOWED_ORIGIN env var to your frontend URL.
// Falls back to '*' for local development convenience.
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: allowedOrigin !== '*',
}));

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(rateLimit);

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'University Chatbot API is running' });
});

// Diagnostics endpoint to debug Vercel file paths
app.get('/api/health/diagnostics', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const diagnostics = {
    cwd: process.cwd(),
    dirname: __dirname,
    node_version: process.version,
    store_docs_count: searchService.documents.length,
    groq_api_key_set: !!process.env.GROQ_API_KEY,
    groq_api_key_prefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 7) + '...' : 'NOT SET',
    paths_checked: searchService.possiblePaths.map(p => ({
      path: p,
      exists: fs.existsSync(p)
    }))
  };

  res.json(diagnostics);
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'NEU UniBot API',
    endpoints: {
      health: '/health',
      chat: '/api/chat/message'
    }
  });
});

// Eagerly load the search index so it's ready before the first request
searchService.initialize()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`CORS origin: ${allowedOrigin}`);
      });
    }
  })
  .catch((err) => {
    console.error('⚠️  Failed to load search index, starting anyway:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (without search data)`);
      });
    }
  });

module.exports = app;