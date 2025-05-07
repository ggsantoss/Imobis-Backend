import { FastifyRequest, FastifyReply } from 'fastify';
import Joi from 'joi';
import { PaymentStatus } from '@prisma/client';
import { PaymentRepository } from '../../repository/paymentRepository';
import { AdRepository } from '../../repository/advertisementRepository';
import { addMonths } from 'date-fns';
import {
  fetchMerchantOrder,
  fetchPaymentDetails,
} from '../../utils/mpPaymentUtils';

interface MercadoPagoWebhookDTO {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'merchant_order';
  date_created: string;
  user_id: string;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

const schema = Joi.object<MercadoPagoWebhookDTO>({
  id: Joi.number().required(),
  live_mode: Joi.boolean().required(),
  type: Joi.string().valid('payment', 'merchant_order').required(),
  date_created: Joi.string().isoDate().required(),
  user_id: Joi.string().required(),
  api_version: Joi.string().valid('v1').required(),
  action: Joi.string().required(),
  data: Joi.object({
    id: Joi.string().required(),
  }).required(),
});

const statusMap: Record<string, PaymentStatus> = {
  approved: PaymentStatus.APPROVED,
  rejected: PaymentStatus.DENIED,
  pending: PaymentStatus.PENDING,
};

export class BuyAdNotificationController {
  static async handleNotification(
    req: FastifyRequest<{ Body: MercadoPagoWebhookDTO }>,
    reply: FastifyReply,
  ) {
    const { error } = schema.validate(req.body);
    if (error) {
      return reply.status(400).send({ error: error.details[0].message });
    }

    const { type, data } = req.body;

    try {
      if (type === 'payment') {
        return await BuyAdNotificationController.handlePayment(data.id, reply);
      }

      if (type === 'merchant_order') {
        return await BuyAdNotificationController.handleMerchantOrder(
          data.id,
          reply,
        );
      }

      return reply
        .status(400)
        .send({ error: 'Unrecognized notification type.' });
    } catch (err) {
      console.error(err);
      return reply.status(500).send({
        error: 'Internal error while processing notification.',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private static async handlePayment(paymentId: string, reply: FastifyReply) {
    const response = await fetchPaymentDetails(paymentId);

    const mpPayment = await response.json();

    if (!mpPayment.external_reference || !statusMap[mpPayment.status]) {
      return reply
        .status(400)
        .send({ error: 'Invalid payment or unsupported status.' });
    }

    const paymentFromDb = await PaymentRepository.findByExternalRef(
      mpPayment.external_reference,
    );
    if (!paymentFromDb) {
      return reply
        .status(404)
        .send({ error: 'Payment not found in the database.' });
    }

    if (
      paymentFromDb.status === PaymentStatus.APPROVED &&
      mpPayment.status !== 'approved'
    ) {
      return reply.status(400).send({
        error: 'Cannot downgrade the status of an approved payment.',
      });
    }

    const mappedStatus = statusMap[mpPayment.status];
    const updated = await PaymentRepository.updateStatus(
      mpPayment.external_reference,
      mappedStatus,
      String(mpPayment.id),
    );

    const reference = mpPayment.external_reference;
    const adId = parseInt(reference.split('-')[1]);
    const quantity = parseInt(
      mpPayment.metadata?.quantity?.toString() ?? '1',
      10,
    );

    const ad = await AdRepository.findById(adId);
    if (!ad) {
      return reply.status(404).send({ error: 'Ad not found' });
    }

    const expiresAt = ad.paid_visibility_expires_at
      ? addMonths(new Date(ad.paid_visibility_expires_at), quantity)
      : addMonths(new Date(), quantity);

    await AdRepository.updateMonthsPaid(adId, quantity);

    if (updated.adId !== null) {
      await AdRepository.updatePaidVisibility(updated.adId, true, expiresAt);
    }

    return reply.send({
      status: 'Payment successfully processed.',
      payment: updated,
    });
  }

  private static async handleMerchantOrder(
    orderId: string,
    reply: FastifyReply,
  ) {
    const response = await fetchMerchantOrder(orderId);

    const order = await response.json();

    if (!order.payments || order.payments.length === 0) {
      return reply
        .status(400)
        .send({ error: 'No payments associated with the order.' });
    }

    const updatedPayments = [];

    for (const payment of order.payments) {
      if (payment.status !== 'approved' || !payment.external_reference)
        continue;

      const paymentFromDb = await PaymentRepository.findByExternalRef(
        payment.external_reference,
      );
      if (!paymentFromDb) continue;

      if (
        paymentFromDb.status === PaymentStatus.APPROVED &&
        payment.status !== 'approved'
      ) {
        continue;
      }

      const mappedStatus = statusMap[payment.status];
      if (!mappedStatus) continue;

      const updated = await PaymentRepository.updateStatus(
        payment.external_reference,
        mappedStatus,
        String(payment.id),
      );

      updatedPayments.push(updated);
    }

    if (updatedPayments.length === 0) {
      return reply
        .status(400)
        .send({ error: 'No valid payments were updated.' });
    }

    return reply.send({
      status: 'Payments successfully processed.',
      payments: updatedPayments,
    });
  }
}
