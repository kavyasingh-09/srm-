import pool from './pool.js';

const SCHEMA = `
-- SRM Campus Marketplace — PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  campus        VARCHAR(100) NOT NULL DEFAULT 'Kattankulathur',
  hostel        VARCHAR(100),
  phone         VARCHAR(50),
  gender        VARCHAR(10) DEFAULT 'male',
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  avatar        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'male';

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS lost_found_reports (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  type            VARCHAR(10) NOT NULL CHECK (type IN ('Lost', 'Found')),
  category        VARCHAR(100) NOT NULL,
  campus          VARCHAR(100) NOT NULL,
  location        TEXT NOT NULL,
  description     TEXT NOT NULL,
  image           TEXT,
  contact_name    VARCHAR(255) NOT NULL,
  contact_details TEXT NOT NULL,
  created_at      DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_lost_found_type ON lost_found_reports (type);
CREATE INDEX IF NOT EXISTS idx_lost_found_campus ON lost_found_reports (campus);
CREATE INDEX IF NOT EXISTS idx_lost_found_created ON lost_found_reports (created_at DESC);

CREATE TABLE IF NOT EXISTS listings (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  trade_type      VARCHAR(20) NOT NULL,
  condition       VARCHAR(50),
  description     TEXT NOT NULL,
  campus          VARCHAR(100) NOT NULL,
  hostel          VARCHAR(100),
  course_code     VARCHAR(50),
  image           TEXT,
  file_url        TEXT,
  file_name       VARCHAR(255),
  meetup_hotspot  TEXT,
  seller_name     VARCHAR(255) NOT NULL,
  seller_email    VARCHAR(255) NOT NULL,
  seller_phone    VARCHAR(50),
  seller_verified BOOLEAN NOT NULL DEFAULT FALSE,
  seller_avatar   TEXT,
  created_at      DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_listings_campus ON listings (campus);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings (created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

-- Drop and recreate chat_messages with TEXT listing_id to support both real and mock listing IDs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'listing_id' AND data_type = 'integer') THEN
    DROP TABLE IF EXISTS chat_messages;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  listing_id TEXT NOT NULL,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_message TEXT NOT NULL,
  iv TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_listing_id ON chat_messages (listing_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_participants ON chat_messages (sender_id, receiver_id);
`;

export async function initDatabase() {
  await pool.query(SCHEMA);
  console.log('Database schema ready.');
}
