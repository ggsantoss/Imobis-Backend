import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { BuyCredtisController } from './buyCreditsController';
import { CreditsRepository } from '../../../../repository/creditsRepository';
import { PaymentRepository } from '../../../../repository/paymentRepository';
import { PaymentStatus } from '@prisma/client';

interface PaymentNotificationBody {
  collection_id: string;
  collection_status: string;
  payment_id: string;
  status: string;
  external_reference: string;
  payment_type: string;
  merchant_order_id: string;
  preference_id: string;
  site_id: string;
  processing_mode: string;
  merchant_account_id: string | null;
  balance: number;
}

interface PaymentNotificationQuery {
  external_reference: string;
}

export class BuyCreditsNotification {
  static async creditsNotification(
    req: FastifyRequest<{ Querystring: PaymentNotificationQuery }>,
    reply: FastifyReply,
  ) {
    const userSchema = Joi.object({
      collection_id: Joi.string().required(),
      collection_status: Joi.string().required(),
      payment_id: Joi.string().required(),
      status: Joi.string().required(),
      external_reference: Joi.string().required(),
      payment_type: Joi.string().required(),
      merchant_order_id: Joi.string().required(),
      preference_id: Joi.string().required(),
      site_id: Joi.string().required(),
      processing_mode: Joi.string().required(),
      merchant_account_id: Joi.string().allow(null),
      balance: Joi.number().required(),
    });

    try {
      const { error, value } = userSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }
      const data: PaymentNotificationBody = value;

      const userId = parseInt(data.external_reference.replace('user_', ''));

      const statusMap: Record<string, PaymentStatus> = {
        approved: PaymentStatus.APPROVED,
        failed: PaymentStatus.DENIED,
        pending: PaymentStatus.PENDING,
      };

      const newStatus = statusMap[data.status] || PaymentStatus.PENDING;
      const externalRef = data.external_reference;

      await PaymentRepository.updateStatus(externalRef, newStatus);

      if (data.status === 'approved' && data.collection_status === 'approved') {
        await CreditsRepository.updateCredits(userId, data.balance);
      }

      reply.send({ status: 'success' });
    } catch (err) {
      console.error('Error updating payment status', err);
      reply.status(500).send({
        status: 'error',
        message: 'Error processing payment status update',
      });
    }
  }
}
