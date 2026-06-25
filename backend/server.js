import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/init.js';
import authRoutes from './routes/auth.js';
import lostFoundRoutes from './routes/lostFound.js';
import listingsRoutes from './routes/listings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const isLocalDevOrigin = (origin) =>
  !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
  origin(origin, callback) {
    if (isLocalDevOrigin(origin)) {
      callback(null, true);
    } else if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'campus-marketplace-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/listings', listingsRoutes);

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and configure PostgreSQL.');
    process.exit(1);
  }

  try {
    await initDatabase();
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API server running on http://127.0.0.1:${PORT}`);
  });
}

start();
