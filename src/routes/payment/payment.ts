import { FastifyInstance } from 'fastify';
import { PaymentController } from '../../controllers/paymentsController/paymentsController';
import { PaymentNotificationController } from '../../controllers/paymentsController/paymentNotificationController';
import { BuyCredtisController } from '../../controllers/paymentsController/credits/buy/buyCreditsController';
import { BuyCreditsNotification } from '../../controllers/paymentsController/credits/buy/buyCreditsNotification';

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.post('/payment/newPayment', PaymentController.newPayment);
  fastify.post(
    '/payment/notification',
    PaymentNotificationController.handleNotification,
  );

  fastify.post('/payments/credits/buy', BuyCredtisController.buy);
  fastify.post(
    '/payments/credits/notification',
    BuyCreditsNotification.creditsNotification,
  );
}
