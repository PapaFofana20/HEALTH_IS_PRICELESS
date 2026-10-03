import { verifyToken } from '../services/userService.js';
import cookie from 'cookie';

export function authMiddleware(req, res, next) {
  let token = null;

  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    token = cookies.auth_token;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token requis' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide ou expiré' });
  }
  req.userId = payload.userId;
  next();
}