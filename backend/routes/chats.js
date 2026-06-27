import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/chats/:listingId/:otherUserId
// Retrieve encrypted conversation history between logged-in user and otherUserId for a specific listing
router.get('/:listingId/:otherUserId', requireAuth, async (req, res) => {
  try {
    const { listingId, otherUserId } = req.params;
    const currentUserId = req.user.id;

    const result = await pool.query(
      `SELECT id, listing_id AS "listingId", sender_id AS "senderId", receiver_id AS "receiverId",
              encrypted_message AS "encryptedMessage", iv, signature, created_at AS "createdAt"
       FROM chat_messages
       WHERE listing_id = $1
         AND (
           (sender_id = $2 AND receiver_id = $3)
           OR
           (sender_id = $3 AND receiver_id = $2)
         )
       ORDER BY created_at ASC`,
      [listingId, currentUserId, otherUserId]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Failed to get chat messages:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/chats/:listingId/:receiverId
// Save a new encrypted message packet
router.post('/:listingId/:receiverId', requireAuth, async (req, res) => {
  try {
    const { listingId, receiverId } = req.params;
    const currentUserId = req.user.id;
    const { encryptedMessage, iv, signature } = req.body;

    if (!encryptedMessage || !iv || !signature) {
      return res.status(400).json({ error: 'Missing encrypted message payload.' });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (listing_id, sender_id, receiver_id, encrypted_message, iv, signature)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, listing_id AS "listingId", sender_id AS "senderId", receiver_id AS "receiverId",
                 encrypted_message AS "encryptedMessage", iv, signature, created_at AS "createdAt"`,
      [listingId, currentUserId, receiverId, encryptedMessage, iv, signature]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('Failed to send chat message:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
