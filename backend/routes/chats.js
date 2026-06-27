import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/chats
// List the logged-in user's latest item-based conversations.
router.get('/', requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const result = await pool.query(
      `WITH mine AS (
         SELECT m.*,
                CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
                LEAST(sender_id, receiver_id) AS user_low,
                GREATEST(sender_id, receiver_id) AS user_high
         FROM chat_messages m
         WHERE sender_id = $1 OR receiver_id = $1
       ),
       latest AS (
         SELECT DISTINCT ON (listing_id, user_low, user_high)
                *
         FROM mine
         ORDER BY listing_id, user_low, user_high, created_at DESC, id DESC
       )
       SELECT latest.id, latest.listing_id AS "listingId", latest.sender_id AS "senderId",
              latest.receiver_id AS "receiverId", latest.other_user_id AS "otherUserId",
              latest.encrypted_message AS "encryptedMessage", latest.iv, latest.signature,
              latest.created_at AS "createdAt",
              other_user.name AS "otherUserName", other_user.avatar AS "otherUserAvatar",
              listings.title AS "listingTitle", listings.price AS "listingPrice",
              listings.image AS "listingImage"
       FROM latest
       LEFT JOIN users other_user ON other_user.id = latest.other_user_id
       LEFT JOIN listings ON regexp_replace(latest.listing_id::text, '^lst-', '') ~ '^[0-9]+$'
                         AND listings.id = regexp_replace(latest.listing_id, '^lst-', '')::integer
       ORDER BY latest.created_at DESC`,
      [currentUserId]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('Failed to list chat conversations:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

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
    const parsedReceiverId = Number(receiverId);
    const { encryptedMessage, iv, signature } = req.body;

    if (!encryptedMessage || !iv || !signature) {
      return res.status(400).json({ error: 'Missing encrypted message payload.' });
    }

    if (!Number.isInteger(parsedReceiverId) || parsedReceiverId <= 0) {
      return res.status(400).json({ error: 'Invalid chat recipient.' });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (listing_id, sender_id, receiver_id, encrypted_message, iv, signature)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, listing_id AS "listingId", sender_id AS "senderId", receiver_id AS "receiverId",
                 encrypted_message AS "encryptedMessage", iv, signature, created_at AS "createdAt"`,
      [listingId, currentUserId, parsedReceiverId, encryptedMessage, iv, signature]
    );

    const [senderResult, listingResult] = await Promise.all([
      pool.query('SELECT name FROM users WHERE id = $1', [currentUserId]),
      pool.query(
        `SELECT title FROM listings
         WHERE regexp_replace($1::text, '^lst-', '') ~ '^[0-9]+$'
           AND id = regexp_replace($1::text, '^lst-', '')::integer`,
        [listingId]
      ),
    ]);

    const senderName = senderResult.rows[0]?.name || 'Someone';
    const listingTitle = listingResult.rows[0]?.title || 'your listing';

    if (parsedReceiverId !== currentUserId) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, listing_id, actor_id, conversation_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          parsedReceiverId,
          'New message',
          `${senderName} messaged you about "${listingTitle}".`,
          listingId,
          currentUserId,
          currentUserId,
        ]
      );
    }

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('Failed to send chat message:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
