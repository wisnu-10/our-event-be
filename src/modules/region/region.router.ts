import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { regionController } from './region.controller';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import { queryRegencySchema } from './validators/region.validator';

const router = Router();
const regionLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60 });

router.get('/provinces', regionLimiter, regionController.provinces);
router.get(
  '/regencies',
  regionLimiter,
  validateRequest(queryRegencySchema, 'query'),
  regionController.regencies,
);

export default router;
