/* Anti brute-force minimaliste (mémoire du processus).
   Pour la prod, passer à express-rate-limit + store Redis. */

const hits = new Map();

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 30 } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives, réessaie plus tard' });
    }
    return next();
  };
}
