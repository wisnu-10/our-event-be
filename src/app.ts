import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { NODE_ENV, PORT } from './config/main.config';
import { corsOptions } from './config/cors.config';
import authRouter from './modules/auth/auth.router';
import userRouter from './modules/user/user.router';
import adminUserRouter from './modules/admin-users/admin-user.router';
import eventRouter from './modules/event/event.router';
import regionRouter from './modules/region/region.router';
import orderRouter from './modules/order/order.router';
import ticketRouter from './modules/ticket/ticket.router';
import dashboardRouter from './modules/dashboard/dashboard.router';
import { orderService } from './modules/order/order.service';
import { errorHandler, notFound } from './middlewares/error.middleware';

export const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OK', data: { status: 'ok' } });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin/users', adminUserRouter);
app.use('/api/events', eventRouter);
app.use('/api/regions', regionRouter);
app.use('/api/orders', orderRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/dashboard', dashboardRouter);

app.use(notFound);
app.use(errorHandler);

if (NODE_ENV !== 'production') {
  orderService.startExpiryJob();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend Our Event jalan di http://localhost:${PORT}`);
  });
}

export default app;
