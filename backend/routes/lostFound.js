import { Router } from 'express';
import pool from '../db/pool.js';
import { formatLostFound, requireAuth } from '../middleware/auth.js';

const router = Router();

const REPORT_COLUMNS = `
  id, user_id, title, type, category, campus, location, description,
  image, contact_name, contact_details, created_at
`;

function parseReportId(paramId) {
  const match = String(paramId).match(/^lf-(\d+)$/);
  return match ? Number(match[1]) : Number(paramId);
}

// GET /api/lost-found — list all reports (public)
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, title, type, category, campus, location, description,
              image, contact_name, contact_details, created_at
       FROM lost_found_reports
       ORDER BY created_at DESC, id DESC`
    );

    res.json({ items: result.rows.map(formatLostFound) });
  } catch (err) {
    console.error('List lost-found error:', err);
    res.status(500).json({ error: 'Failed to fetch lost & found reports.' });
  }
});

// POST /api/lost-found — create a report (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      campus,
      location,
      description,
      image,
      contactName,
      contactDetails,
    } = req.body;

    if (!title || !type || !category || !campus || !location || !description || !contactName || !contactDetails) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    if (!['Lost', 'Found'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Lost or Found.' });
    }

    const result = await pool.query(
      `INSERT INTO lost_found_reports
         (user_id, title, type, category, campus, location, description, image, contact_name, contact_details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id, title, type, category, campus, location, description,
                 image, contact_name, contact_details, created_at`,
      [
        req.user.id,
        title.trim(),
        type,
        category,
        campus,
        location.trim(),
        description.trim(),
        image || null,
        contactName.trim(),
        contactDetails.trim(),
      ]
    );

    res.status(201).json({ item: formatLostFound(result.rows[0]) });
  } catch (err) {
    console.error('Create lost-found error:', err);
    res.status(500).json({ error: 'Failed to create report.' });
  }
});

// PUT /api/lost-found/:id — update own report (auth required)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const reportId = parseReportId(req.params.id);
    if (!reportId || Number.isNaN(reportId)) {
      return res.status(400).json({ error: 'Invalid report id.' });
    }

    const {
      title,
      type,
      category,
      campus,
      location,
      description,
      image,
      contactName,
      contactDetails,
    } = req.body;

    if (!title || !type || !category || !campus || !location || !description || !contactName || !contactDetails) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    if (!['Lost', 'Found'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Lost or Found.' });
    }

    const result = await pool.query(
      `UPDATE lost_found_reports SET
         title = $1, type = $2, category = $3, campus = $4, location = $5,
         description = $6, image = $7, contact_name = $8, contact_details = $9
       WHERE id = $10 AND user_id = $11
       RETURNING ${REPORT_COLUMNS}`,
      [
        title.trim(),
        type,
        category,
        campus,
        location.trim(),
        description.trim(),
        image || null,
        contactName.trim(),
        contactDetails.trim(),
        reportId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or you do not have permission to edit it.' });
    }

    res.json({ item: formatLostFound(result.rows[0]) });
  } catch (err) {
    console.error('Update lost-found error:', err);
    res.status(500).json({ error: 'Failed to update report.' });
  }
});

// DELETE /api/lost-found/:id — remove own report (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reportId = parseReportId(req.params.id);
    if (!reportId || Number.isNaN(reportId)) {
      return res.status(400).json({ error: 'Invalid report id.' });
    }

    const result = await pool.query(
      'DELETE FROM lost_found_reports WHERE id = $1 AND user_id = $2 RETURNING id',
      [reportId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or you do not have permission to delete it.' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete lost-found error:', err);
    res.status(500).json({ error: 'Failed to delete report.' });
  }
});

export default router;
