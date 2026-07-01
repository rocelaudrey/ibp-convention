import jwt from 'jsonwebtoken';

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

// Verifies the JWT and attaches { userId, username, role } to req.auth.
export function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Missing token.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (!payload.userId || !payload.role) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireSuperAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin only.' });
    }
    next();
  });
}

// Back-compat alias so existing attendee routes keep working.
export const requireAdmin = requireAuth;
