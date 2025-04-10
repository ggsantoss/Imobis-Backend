import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';
import { MercadoPagoConfig } from 'mercadopago';
import { envConfig } from '../../config/envConfig';
import { PaymentRepository } from '../../repository/paymentRepository';
import { PaymentStatus } from '@prisma/client';

const client = new MercadoPagoConfig({
  accessToken: envConfig.MP_ACCESS_TOKEN,
});

interface PaymentNotificationBody extends RouteGenericInterface {
  Body: {
    id: string;
    status: string;
    external_reference: string;
  };
}

export class PaymentNotificationController {
  static async handleNotification(
    req: FastifyRequest<PaymentNotificationBody>,
    reply: FastifyReply,
  ) {
    try {
      const { id, status, external_reference } = req.body;

      if (!id || !status || !external_reference) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const statusMap: Record<string, PaymentStatus> = {
        approved: PaymentStatus.APPROVED,
        failed: PaymentStatus.DENIED,
        pending: PaymentStatus.PENDING,
      };

      const newStatus = statusMap[status] || PaymentStatus.PENDING;

      const payment = await PaymentRepository.updateStatus(
        external_reference,
        newStatus,
      );

      reply.send({ status: 'success' });
    } catch (error) {
      console.error('Error processing the payment notification:', error);
      reply.status(500).send({
        status: 'error',
        message: 'Error processing the notification',
      });
    }
  }
}
