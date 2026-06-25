import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    campus: row.campus,
    hostel: row.hostel,
    phone: row.phone,
    verified: row.verified,
    avatar: row.avatar,
  };
}

export function formatLostFound(row) {
  return {
    id: `lf-${row.id}`,
    title: row.title,
    type: row.type,
    category: row.category,
    campus: row.campus,
    location: row.location,
    description: row.description,
    image: row.image,
    contactName: row.contact_name,
    contactDetails: row.contact_details,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString().split('T')[0]
      : String(row.created_at).split('T')[0],
    userId: row.user_id,
  };
}

export function formatListing(row) {
  return {
    id: `lst-${row.id}`,
    title: row.title,
    category: row.category,
    price: Number(row.price),
    tradeType: row.trade_type,
    condition: row.condition,
    description: row.description,
    campus: row.campus,
    hostel: row.hostel,
    courseCode: row.course_code,
    image: row.image,
    fileUrl: row.file_url,
    fileName: row.file_name,
    meetupHotspot: row.meetup_hotspot,
    seller: {
      name: row.seller_name,
      email: row.seller_email,
      phone: row.seller_phone,
      verified: row.seller_verified,
      avatar: row.seller_avatar,
    },
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString().split('T')[0]
      : String(row.created_at).split('T')[0],
    userId: row.user_id,
  };
}
