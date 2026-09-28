import { Router } from 'express';
import { eventController } from './event.controller';
import { jwtVerify, roleverify } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import {
  createEventSchema,
  idParamSchema,
  publishEventSchema,
  queryEventSchema,
  slugParamSchema,
  updateEventSchema,
} from './validators/event.validator';

const router = Router();

router.get('/', validateRequest(queryEventSchema, 'query'), eventController.listPublic);
router.get(
  '/mine',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(queryEventSchema, 'query'),
  eventController.listMine,
);
router.get('/:slug', validateRequest(slugParamSchema, 'params'), eventController.detail);
router.post(
  '/',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(createEventSchema),
  eventController.create,
);
router.put(
  '/:id',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(idParamSchema, 'params'),
  validateRequest(updateEventSchema),
  eventController.update,
);
router.delete(
  '/:id',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(idParamSchema, 'params'),
  eventController.remove,
);
router.patch(
  '/:id/publish',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(idParamSchema, 'params'),
  validateRequest(publishEventSchema),
  eventController.publish,
);

export default router;
