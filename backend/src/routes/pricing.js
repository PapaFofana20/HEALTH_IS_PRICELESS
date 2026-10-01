import { Router } from 'express';
import { planPricing, pricingFeatures } from '../data/pricing.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ data: { plans: planPricing, features: pricingFeatures } });
});

export { router as pricingRouter };
