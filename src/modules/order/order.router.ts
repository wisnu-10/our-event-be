import { Router } from 'express';
import { orderController } from './order.controller';
import { jwtVerify, roleverify } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import { uploadSingle } from '../../middlewares/upload.middleware';
import {
  createOrderSchema,
  orderCodeParamSchema,
  queryOrderSchema,
  rejectOrderSchema,
} from './validators/order.validator';

const router = Router();

router.post(
  '/',
  jwtVerify(),
  roleverify(['CUSTOMER']),
  validateRequest(createOrderSchema),
  orderController.create,
);
router.get(
  '/my',
  jwtVerify(),
  roleverify(['CUSTOMER']),
  validateRequest(queryOrderSchema, 'query'),
  orderController.listMine,
);
router.get(
  '/:orderCode',
  jwtVerify(),
  validateRequest(orderCodeParamSchema, 'params'),
  orderController.detail,
);
router.post(
  '/:orderCode/proof',
  jwtVerify(),
  roleverify(['CUSTOMER']),
  validateRequest(orderCodeParamSchema, 'params'),
  uploadSingle('proof'),
  orderController.uploadProof,
);
router.patch(
  '/:orderCode/cancel',
  jwtVerify(),
  roleverify(['CUSTOMER']),
  validateRequest(orderCodeParamSchema, 'params'),
  orderController.cancel,
);
router.get(
  '/',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(queryOrderSchema, 'query'),
  orderController.listAll,
);
router.patch(
  '/:orderCode/approve',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(orderCodeParamSchema, 'params'),
  orderController.approve,
);
router.patch(
  '/:orderCode/reject',
  jwtVerify(),
  roleverify(['ADMIN', 'SUPERADMIN']),
  validateRequest(orderCodeParamSchema, 'params'),
  validateRequest(rejectOrderSchema),
  orderController.reject,
);

export default router;
