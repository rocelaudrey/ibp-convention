import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not configured on server.' });
  }
  if (!password || password !== expected) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '12h' }
  );
  res.json({ token });
});

export default router;
