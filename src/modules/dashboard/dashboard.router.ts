import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { jwtVerify, roleverify } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/stats', jwtVerify(), roleverify(['ADMIN', 'SUPERADMIN']), dashboardController.stats);

export default router;
