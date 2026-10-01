import { Router } from 'express';
import { programs } from '../data/programs.js';

const router = Router();

router.get('/', (req, res) => {
  const { goal, level, plan, search } = req.query;
  let result = [...programs];
  if (goal) result = result.filter((p) => p.goal === goal);
  if (level) result = result.filter((p) => p.level === level);
  if (plan) result = result.filter((p) => p.plan === plan);
  if (typeof search === 'string' && search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) => p.name.fr.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q) || p.tagline.fr.toLowerCase().includes(q),
    );
  }
  res.json({ data: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const program = programs.find((p) => p.id === req.params.id);
  if (!program) return res.status(404).json({ error: 'PROGRAM_NOT_FOUND' });
  res.json({ data: program });
});

export { router as programsRouter };
