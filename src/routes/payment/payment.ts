import { FastifyInstance } from 'fastify';
import { PaymentController } from '../../controllers/paymentsController/paymentsController';
import { PaymentNotificationController } from '../../controllers/paymentsController/paymentNotificationController';
import { BuyCreditsController } from '../../controllers/paymentsController/credits/buy/buyCreditsController';
import { BuyCreditsNotification } from '../../controllers/paymentsController/credits/buy/buyCreditsNotification';
import { authMiddleware } from '../../middleware/authMiddleware';
import { verifyAdmin } from '../../middleware/verifyAdmin';

export async function paymentRoutes(fastify: FastifyInstance) {
  // Pagamentos gerais
  fastify.post(
    '/payments/new',
    { preHandler: authMiddleware },
    PaymentController.newPayment,
  );

  fastify.post(
    '/payments/notification',
    { preHandler: [authMiddleware, verifyAdmin] },
    PaymentNotificationController.handleNotification,
  );

  // Compra de créditos
  fastify.post(
    '/payments/credits/buy',
    { preHandler: authMiddleware },
    BuyCreditsController.buy,
  );

  fastify.post(
    '/payments/credits/notification',
    { preHandler: [authMiddleware, verifyAdmin] },
    BuyCreditsNotification.creditsNotification,
  );
}
