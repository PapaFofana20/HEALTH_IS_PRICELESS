/* Rate limiting en mémoire (single-instance).
   Les compteurs vivent dans le processus : ils ne sont pas partagés entre
   instances et repartent à zéro au redémarrage. */

function getKey(req) {
  return req.ip ?? 'unknown';
}

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 30 } = {}) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) hits.delete(key);
    }
  }, 30_000).unref();

  return (req, res, next) => {
    const key = `rl:${getKey(req)}`;
    const now = Date.now();

    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.start + windowMs - now) / 1000));
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives, réessaie plus tard' });
    }
    return next();
  };
}
