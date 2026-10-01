import { Router } from 'express';
import { nutritionTips, mealPlans } from '../data/nutrition.js';

const router = Router();

router.get('/tips', (req, res) => {
  res.json({ data: nutritionTips });
});

router.get('/meal-plans', (req, res) => {
  const { goal } = req.query;
  let result = [...mealPlans];
  if (goal) result = result.filter((p) => p.goal === goal);
  res.json({ data: result });
});

export { router as nutritionRouter };
