import { Router } from 'express';
import { ticketController } from './ticket.controller';
import { jwtVerify } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/request-validation.middleware';
import { orderCodeParamSchema } from './validators/ticket.validator';

const router = Router();

router.get(
  '/order/:orderCode',
  jwtVerify(),
  validateRequest(orderCodeParamSchema, 'params'),
  ticketController.listByOrder,
);

export default router;
