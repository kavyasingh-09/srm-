import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
// Fetch all notifications for the logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, message, is_read AS "isRead", created_at AS "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('Failed to get notifications:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PATCH /api/notifications/:id/read
// Mark a notification as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, message, is_read AS "isRead"`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json({ notification: result.rows[0] });
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/notifications/:id
// Delete a specific notification
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete notification:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/notifications/clear
// Clear all notifications for the logged-in user
router.post('/clear', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM notifications
       WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to clear notifications:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
