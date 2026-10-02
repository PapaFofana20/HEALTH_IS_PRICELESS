import express from 'express';
import cors from 'cors';
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
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/programs', programsRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/community', communityRouter);
app.use('/api/pricing', pricingRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HEALTH IS PRICELESS Backend running on port ${PORT}`);
});
