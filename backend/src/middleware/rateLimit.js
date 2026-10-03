/* Rate limiting avec support Redis (prod) + fallback mémoire (dev).
   Prod: définir REDIS_URL (ex: redis://user:pass@host:6379)
   Dev:  sans REDIS_URL -> Map en mémoire (single-instance seulement). */

import { createClient } from 'redis';

let redisClient = null;
let redisReady = false;
let initPromise = null;

async function initRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return { store: 'memory', reason: 'REDIS_URL non défini' };

  // Sans budget de temps borné, node-redis reconnecte indéfiniment et connect()
  // ne rejette jamais : le démarrage du serveur resterait bloqué.
  const connectTimeout = Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 3000;
  let warned = false;

  try {
    redisClient = createClient({
      url,
      socket: {
        connectTimeout,
        reconnectStrategy: (retries) =>
          retries > 5 ? new Error('trop de tentatives de reconnexion') : Math.min(retries * 200, 2000),
      },
    });
    redisClient.on('error', (err) => {
      // Évite de noyer les logs pendant les retries de reconnexion.
      if (!warned) {
        warned = true;
        console.warn('[rateLimit] Redis error:', err.message);
      }
      redisReady = false;
    });
    await redisClient.connect();
    redisReady = true;
    console.info('[rateLimit] Redis connected');
    return { store: 'redis' };
  } catch (err) {
    console.warn('[rateLimit] Redis init failed:', err.message);
    if (redisClient?.isOpen) await redisClient.disconnect().catch(() => {});
    redisClient = null;
    redisReady = false;
    return { store: 'memory', reason: err.message };
  }
}

/**
 * Connexion Redis idempotente. À appeler au démarrage pour vérifier le store
 * réellement utilisé ; sans appel, la connexion est tentée à la première
 * utilisation de rateLimit().
 * @returns {Promise<{store: 'redis'|'memory', reason?: string}>}
 */
export function initRateLimit() {
  if (!initPromise) initPromise = initRedis();
  return initPromise;
}

/** Ferme le client Redis (arrêt propre). */
export async function closeRateLimit() {
  if (redisClient?.isOpen) await redisClient.quit();
  redisReady = false;
  redisClient = null;
}

function getKey(req) {
  return req.ip ?? 'unknown';
}

async function incrementWithRedis(key, windowMs, max) {
  if (!redisReady || !redisClient) return null;
  try {
    const luaScript = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("PEXPIRE", KEYS[1], ARGV[1])
      end
      return current
    `;
    const count = await redisClient.eval(luaScript, { keys: [key], arguments: [String(windowMs)] });
    const ttl = await redisClient.pttl(key);
    return { count: Number(count), ttl: Number(ttl) };
  } catch (err) {
    console.warn('[rateLimit] Redis increment failed:', err.message);
    redisReady = false;
    return null;
  }
}

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 30 } = {}) {
  const hits = new Map();

  // Connexion paresseuse : garantit la tentative même si initRateLimit() n'a pas été appelé.
  void initRateLimit();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) hits.delete(key);
    }
  }, Math.min(windowMs, 60 * 1000)).unref();

  return async (req, res, next) => {
    const key = `rl:${getKey(req)}`;
    const now = Date.now();

    // Essayer Redis d'abord (prod)
    const redisResult = await incrementWithRedis(key, windowMs, max);
    if (redisResult) {
      if (redisResult.count > max) {
        const retryAfterSec = Math.max(1, Math.ceil(redisResult.ttl / 1000));
        res.set('Retry-After', String(retryAfterSec));
        return res.status(429).json({ error: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives, réessaie plus tard' });
      }
      return next();
    }

    // Fallback mémoire (dev / single-instance)
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
