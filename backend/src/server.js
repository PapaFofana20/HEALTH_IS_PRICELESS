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
import { paytechRouter, verifyIpn, activatePlan, findPendingOrderByReference, planPricing, pendingPayments } from './routes/paytech.js';
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
const paytechOrigin = 'https://paytech.sn';

app.set('trust proxy', 1); // Render/Nginx devant Express : IP réelle pour le rate-limit

// Rate-limit global (toutes les routes API) + limite stricte sur l'IPN.
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const ipnLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

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
        connectSrc: ["'self'", apiOrigin, paytechOrigin, 'https://*.supabase.co', 'wss://*.supabase.co'],
        frameSrc: [paytechOrigin],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", paytechOrigin],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Gérer le webhook PayTech IPN AVANT le CORS (appel serveur-à-serveur sans Origin)
app.post('/api/paytech/ipn', ipnLimiter, express.json({ limit: '100kb' }), async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!verifyIpn(body)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'IPN non authentifiée' });
    }
    if (body.type_event === 'sale_complete') {
      // Le ref_command doit correspondre à un paiement que CE serveur a émis.
      // Mémoire d'abord, Supabase (orders pending) en repli après redémarrage.
      const knownEntry = [...pendingPayments.entries()].find(([, v]) => v.refCommand === body.ref_command);
      let known = knownEntry?.[1] ?? null;
      if (!known && body.ref_command) {
        const row = await findPendingOrderByReference(body.ref_command);
        if (row) {
          known = {
            plan: row.plan ?? row.Plan,
            goal: row.goal ?? row.Goal,
            userId: row.user_id ?? row.userId,
            refCommand: body.ref_command,
          };
        }
      }
      if (!known) {
        console.error(`PayTech IPN: ref_command inconnu (${body.ref_command ?? 'absent'}) — activation refusée`);
        return res.status(409).json({ error: 'UNKNOWN_PAYMENT', message: 'Paiement non enregistré par ce serveur' });
      }

      const targetPlan = known.plan;
      const targetGoal = known.goal;
      const targetUserId = known.userId;
      const paidAmount = Number(body.final_item_price ?? body.item_price);

      const expectedAmount = planPricing[targetGoal]?.[targetPlan]?.annual;
      // expectedAmount doit exister ET le montant payé être connu : sinon la
      // comparaison est sans effet et l'activation passe sans vérification.
      if (!Number.isFinite(expectedAmount) || !Number.isFinite(paidAmount) || paidAmount < expectedAmount) {
        console.error(`PayTech IPN: Montant payé ${paidAmount} inférieur au montant attendu ${expectedAmount}`);
        return res.status(400).json({ error: 'INVALID_AMOUNT' });
      }

      await activatePlan({
        userId: targetUserId,
        plan: targetPlan,
        amount: paidAmount,
        reference: body.ref_command ?? known?.refCommand,
      });

      if (knownEntry) {
        pendingPayments.delete(knownEntry[0]);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement IPN PayTech:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
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
app.use('/api/paytech', paytechRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
