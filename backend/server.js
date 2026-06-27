import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/init.js';
import authRoutes from './routes/auth.js';
import lostFoundRoutes from './routes/lostFound.js';
import listingsRoutes from './routes/listings.js';
import notificationsRoutes from './routes/notifications.js';
import chatsRoutes from './routes/chats.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

const isAllowedOrigin = (origin) => {
  // Allow same-origin requests (no origin header) and localhost in dev
  if (!origin) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Allow any vercel.app subdomain (preview and production deployments)
  if (/^https:\/\/[a-zA-Z0-9-]+(\.vercel\.app)$/.test(origin)) return true;
  // Allow explicit CLIENT_ORIGIN env var
  if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) return true;
  return false;
};

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

let dbInitialized = false;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
      }
      await initDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error('Database initialization failed:', err.message);
      return res.status(500).json({ error: `Database initialization failed: ${err.message}` });
    }
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'campus-marketplace-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chats', chatsRoutes);


async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and configure PostgreSQL.');
    process.exit(1);
  }

  try {
    await initDatabase();
    dbInitialized = true;
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API server running on http://127.0.0.1:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  start();
}

