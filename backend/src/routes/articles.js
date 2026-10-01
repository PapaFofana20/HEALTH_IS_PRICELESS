import { Router } from 'express';
import { articles } from '../data/articles.js';

const router = Router();

router.get('/', (req, res) => {
  const { category, featured } = req.query;
  let result = [...articles];
  if (category) result = result.filter((a) => a.category === category);
  if (featured === 'true') result = result.filter((a) => a.featured);
  res.json({ data: result, total: result.length });
});

router.get('/:id', (req, res) => {
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'ARTICLE_NOT_FOUND' });
  res.json({ data: article });
});

export { router as articlesRouter };
