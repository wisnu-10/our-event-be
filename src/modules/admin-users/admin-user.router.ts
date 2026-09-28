import { Router } from 'express';
import { adminUserController } from './admin-user.controller';
import { jwtVerify, roleverify } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import {
  adminUserIdParamSchema,
  createAdminUserSchema,
  queryAdminUserSchema,
  updateAdminUserRoleSchema,
} from './validators/admin-user.validator';

const router = Router();

router.use(jwtVerify(), roleverify(['SUPERADMIN']));

router.get('/', validateRequest(queryAdminUserSchema, 'query'), adminUserController.list);
router.post('/', validateRequest(createAdminUserSchema), adminUserController.create);
router.patch(
  '/:id/role',
  validateRequest(adminUserIdParamSchema, 'params'),
  validateRequest(updateAdminUserRoleSchema),
  adminUserController.updateRole,
);
router.delete('/:id', validateRequest(adminUserIdParamSchema, 'params'), adminUserController.remove);

export default router;
