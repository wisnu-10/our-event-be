import { Router } from 'express';
import { userController } from './user.controller';
import { jwtVerify } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import { updateUserSchema } from './validators/update-user.validator';

const router = Router();

router.get('/me', jwtVerify(), userController.me);
router.patch('/me', jwtVerify(), validateRequest(updateUserSchema), userController.updateMe);

export default router;
