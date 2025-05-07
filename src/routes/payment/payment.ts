import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/authMiddleware';
import { BuyAdController } from '../../controllers/paymentsController/buyAdController';
import { BuyAdNotificationController } from '../../controllers/paymentsController/buyAdNotificationController';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import GetPaymentsInfo from '../../controllers/paymentsController/getPaymentInfo/getPaymentInfoController';

export async function paymentRoutes(fastify: FastifyInstance) {
  // Pagamentos gerais
  fastify.post(
    '/payments',
    { preHandler: authMiddleware },
    BuyAdController.buy,
  );

  fastify.post(
    '/payments/notification',
    { preHandler: [] },
    BuyAdNotificationController.handleNotification,
  );

  fastify.get(
    '/payments/:id',
    { preHandler: [authMiddleware, verifyAdmin] },
    GetPaymentsInfo.getPaymentsInfo,
  );
}
