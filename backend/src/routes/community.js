import { Router } from 'express';
import { testimonials, challenges } from '../data/community.js';

const router = Router();

router.get('/testimonials', (req, res) => {
  res.json({ data: testimonials });
});

router.get('/challenges', (req, res) => {
  res.json({ data: challenges });
});

export { router as communityRouter };
