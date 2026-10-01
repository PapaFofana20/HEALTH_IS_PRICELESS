import { Router } from 'express';
import { recipes } from '../data/recipes.js';

const router = Router();

router.get('/', (req, res) => {
  const { goal, category, search } = req.query;
  let result = [...recipes];
  if (goal) result = result.filter((r) => r.goal === goal || r.goal === 'both');
  if (category) result = result.filter((r) => r.category === category);
  if (typeof search === 'string' && search) {
    const q = search.toLowerCase();
    result = result.filter((r) => r.name.fr.toLowerCase().includes(q) || r.name.en.toLowerCase().includes(q));
  }
  res.json({ data: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const recipe = recipes.find((r) => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: 'RECIPE_NOT_FOUND' });
  res.json({ data: recipe });
});

export { router as recipesRouter };
