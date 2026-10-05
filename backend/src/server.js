import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { programsRouter } from './routes/programs.js';
import { exercisesRouter } from './routes/exercises.js';
import { recipesRouter } from './routes/recipes.js';
import { articlesRouter } from './routes/articles.js';
import { usersRouter } from './routes/users.js';
import { nutritionRouter } from './routes/nutrition.js';
import { communityRouter } from './routes/community.js';
import { pricingRouter } from './routes/pricing.js';
import { saspayRouter, verifyWebhookSignature, processTransactionSuccess } from './routes/saspay.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimit } from './middleware/rateLimit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS origins - MUST be configured via environment variable in production
const corsOriginsEnv = process.env.CORS_ORIGIN;
if (isProduction && !corsOriginsEnv) {
  console.error('[server] CRITICAL: CORS_ORIGIN environment variable is required in production');
  process.exit(1);
}
const allowedOrigins = (corsOriginsEnv ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// In production, validate that no localhost origins are allowed
if (isProduction) {
  const localhostOrigins = allowedOrigins.filter(origin => 
    origin.includes('localhost') || origin.includes('127.0.0.1')
  );
  if (localhostOrigins.length > 0) {
    console.error('[server] CRITICAL: Localhost origins not allowed in production CORS:', localhostOrigins);
    process.exit(1);
  }
}

const apiOrigin = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';

app.set('trust proxy', 1); // Render/Nginx devant Express : IP réelle pour le rate-limit

// Rate-limit global (toutes les routes API) + limite stricte sur le webhook.
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const webhookLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

// CSP via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", isProduction ? "" : "'unsafe-inline'", isProduction ? "" : "'unsafe-eval'"].filter(Boolean),
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", apiOrigin, 'https://*.supabase.co', 'wss://*.supabase.co'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Webhook SasPay AVANT le CORS (appel serveur-à-serveur sans Origin).
// Corps brut requis : la signature HMAC couvre le JSON exact reçu.
app.post('/api/saspay/webhook', webhookLimiter, express.raw({ type: 'application/json', limit: '100kb' }), async (req, res) => {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    if (!verifyWebhookSignature(raw, signature, timestamp)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Webhook non authentifié' });
    }
    let body = null;
    try {
      body = JSON.parse(raw);
    } catch {
      return res.status(400).json({ error: 'INVALID_JSON' });
    }
    if (body?.event === 'transaction.success' && body?.data) {
      const ok = await processTransactionSuccess(body.data);
      if (!ok) console.error('SasPay webhook: activation impossible pour', body.data?.id);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook SasPay:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// Health check AVANT le CORS ( Render / uptime monitors n'envoient pas d'Origin).
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(
  cors({
    origin: (origin, callback) => {
      // En production, exiger un Origin valide. En dev, autoriser les requêtes sans Origin (curl, tests).
      if (!origin) {
        if (isProduction) {
          const err = new Error('Origine requise en production');
          err.code = 'CORS_FORBIDDEN';
          return callback(err);
        }
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const err = new Error('Origine non autorisée par CORS');
      err.code = 'CORS_FORBIDDEN';
      return callback(err);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api/', globalLimiter);

app.use('/api/auth', authRouter);
app.use('/api/programs', programsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/community', communityRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/saspay', saspayRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HEALTH IS PRICELESS Backend running on port ${PORT}`);
  if (isProduction) {
    console.warn('[server] Rate limiting en mémoire : les compteurs ne sont pas partagés entre instances et sont remis à zéro au redémarrage.');
  }
});
