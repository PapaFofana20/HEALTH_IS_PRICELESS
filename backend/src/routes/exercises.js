import { Router } from 'express';
import { exercises } from '../data/exercises.js';

const router = Router();

router.get('/', (req, res) => {
  const { muscle, equipment, type, level, search } = req.query;
  let result = [...exercises];
  if (muscle) result = result.filter((e) => e.muscleGroup === muscle);
  if (equipment) result = result.filter((e) => e.equipment === equipment);
  if (type) result = result.filter((e) => e.type === type);
  if (level) result = result.filter((e) => e.level === level);
  if (typeof search === 'string' && search) {
    const q = search.toLowerCase();
    result = result.filter((e) => e.name.fr.toLowerCase().includes(q) || e.name.en.toLowerCase().includes(q));
  }
  res.json({ data: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const exercise = exercises.find((e) => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ error: 'EXERCISE_NOT_FOUND' });
  res.json({ data: exercise });
});

export { router as exercisesRouter };
