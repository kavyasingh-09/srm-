import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { formatUser, signToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const SRM_EMAIL_SUFFIX = '@srmist.edu.in';

function isSrmEmail(email) {
  return email.toLowerCase().endsWith(SRM_EMAIL_SUFFIX);
}

function avatarForEmail(email) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, campus, hostel, phone } = req.body;

    if (!email || !password || !name || !campus) {
      return res.status(400).json({ error: 'Email, password, name, and campus are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isSrmEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please use your official @srmist.edu.in email.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verified = isSrmEmail(normalizedEmail);
    const avatar = avatarForEmail(normalizedEmail);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, campus, hostel, phone, verified, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, campus, hostel, phone, verified, avatar`,
      [normalizedEmail, passwordHash, name.trim(), campus, hostel || null, phone || null, verified, avatar]
    );

    const user = formatUser(result.rows[0]);
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, email, password_hash, name, campus, hostel, phone, verified, avatar FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = formatUser(row);
    const token = signToken(user);

    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, campus, hostel, phone, verified, avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: formatUser(result.rows[0]) });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

export default router;
