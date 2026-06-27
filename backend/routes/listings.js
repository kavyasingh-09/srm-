import { Router } from 'express';
import pool from '../db/pool.js';
import { formatListing, requireAuth } from '../middleware/auth.js';

const router = Router();

const LISTING_COLUMNS = `
  id, user_id, title, category, price, trade_type, condition, description,
  campus, hostel, course_code, image, file_url, file_name, meetup_hotspot,
  seller_name, seller_email, seller_phone, seller_verified, seller_avatar, created_at
`;

function parseListingId(paramId) {
  const match = String(paramId).match(/^lst-(\d+)$/);
  return match ? Number(match[1]) : Number(paramId);
}

// GET /api/listings — all listings visible to everyone
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${LISTING_COLUMNS}
       FROM listings
       ORDER BY created_at DESC, id DESC`
    );

    res.json({ listings: result.rows.map(formatListing) });
  } catch (err) {
    console.error('List listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// POST /api/listings — create a listing (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      tradeType,
      condition,
      description,
      campus,
      hostel,
      courseCode,
      image,
      fileUrl,
      fileName,
      meetupHotspot,
      seller,
    } = req.body;

    if (!title || !category || !tradeType || !description || !campus || !seller?.name || !seller?.email) {
      return res.status(400).json({ error: 'Title, category, trade type, description, campus, and seller details are required.' });
    }

    const sellerEmail = seller.email.trim().toLowerCase();
    const sellerVerified = sellerEmail.endsWith('@srmist.edu.in');

    const result = await pool.query(
      `INSERT INTO listings
         (user_id, title, category, price, trade_type, condition, description, campus, hostel,
          course_code, image, file_url, file_name, meetup_hotspot,
          seller_name, seller_email, seller_phone, seller_verified, seller_avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING ${LISTING_COLUMNS}`,
      [
        req.user.id,
        title.trim(),
        category,
        Number(price) || 0,
        tradeType,
        condition || null,
        description.trim(),
        campus,
        hostel || null,
        courseCode?.trim().toUpperCase() || null,
        image || null,
        fileUrl || null,
        fileName || null,
        meetupHotspot || null,
        seller.name.trim(),
        sellerEmail,
        seller.phone || null,
        sellerVerified,
        seller.avatar || null,
      ]
    );

    res.status(201).json({ listing: formatListing(result.rows[0]) });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Failed to create listing.' });
  }
});

// PUT /api/listings/:id — update own listing (auth required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const listingId = parseListingId(req.params.id);
    if (!listingId || Number.isNaN(listingId)) {
      return res.status(400).json({ error: 'Invalid listing id.' });
    }

    const {
      title,
      category,
      price,
      tradeType,
      condition,
      description,
      campus,
      hostel,
      courseCode,
      image,
      fileUrl,
      fileName,
      meetupHotspot,
      seller,
    } = req.body;

    if (!title || !category || !tradeType || !description || !campus || !seller?.name || !seller?.email) {
      return res.status(400).json({ error: 'Title, category, trade type, description, campus, and seller details are required.' });
    }

    const sellerEmail = seller.email.trim().toLowerCase();
    const sellerVerified = sellerEmail.endsWith('@srmist.edu.in');

    const result = await pool.query(
      `UPDATE listings SET
         title = $1, category = $2, price = $3, trade_type = $4, condition = $5, description = $6,
         campus = $7, hostel = $8, course_code = $9, image = $10, file_url = $11, file_name = $12,
         meetup_hotspot = $13, seller_name = $14, seller_email = $15, seller_phone = $16,
         seller_verified = $17, seller_avatar = $18
       WHERE id = $19 AND user_id = $20
       RETURNING ${LISTING_COLUMNS}`,
      [
        title.trim(),
        category,
        Number(price) || 0,
        tradeType,
        condition || null,
        description.trim(),
        campus,
        hostel || null,
        courseCode?.trim().toUpperCase() || null,
        image || null,
        fileUrl || null,
        fileName || null,
        meetupHotspot || null,
        seller.name.trim(),
        sellerEmail,
        seller.phone || null,
        sellerVerified,
        seller.avatar || null,
        listingId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or you do not have permission to edit it.' });
    }

    res.json({ listing: formatListing(result.rows[0]) });
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: 'Failed to update listing.' });
  }
});

// DELETE /api/listings/:id — remove own listing (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const listingId = parseListingId(req.params.id);
    if (!listingId || Number.isNaN(listingId)) {
      return res.status(400).json({ error: 'Invalid listing id.' });
    }

    const result = await pool.query(
      'DELETE FROM listings WHERE id = $1 AND user_id = $2 RETURNING id',
      [listingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or you do not have permission to delete it.' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

// POST /api/listings/:id/favorite — Toggle favorite and notify seller (auth required)
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const listingId = parseListingId(req.params.id);
    if (!listingId || Number.isNaN(listingId)) {
      return res.status(400).json({ error: 'Invalid listing id.' });
    }

    // 1. Fetch listing details to find the seller
    const listingRes = await pool.query(
      `SELECT id, user_id, title, seller_name, seller_email FROM listings WHERE id = $1`,
      [listingId]
    );

    if (listingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const listing = listingRes.rows[0];

    // 2. Fetch the current user (buyer) name to include in notification
    const buyerRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const buyerName = buyerRes.rows[0]?.name || 'Someone';

    // 3. Resolve seller's user ID
    let sellerUserId = listing.user_id;
    if (!sellerUserId) {
      const sellerRes = await pool.query('SELECT id FROM users WHERE email = $1', [listing.seller_email]);
      if (sellerRes.rows.length > 0) {
        sellerUserId = sellerRes.rows[0].id;
      }
    }

    // 4. Create notification for seller (only if seller is a valid registered user and is NOT the buyer)
    if (sellerUserId && sellerUserId !== req.user.id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, $2, $3)`,
        [
          sellerUserId,
          'Listing Saved 🌟',
          `${buyerName} saved your listing "${listing.title}".`
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Favorite listing error:', err);
    res.status(500).json({ error: 'Failed to process favorite.' });
  }
});

export default router;
