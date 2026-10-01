import { verifyToken } from '../services/userService.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token requis' });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide ou expiré' });
  }
  req.userId = payload.userId;
  next();
}
