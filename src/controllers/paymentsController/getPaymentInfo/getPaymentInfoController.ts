import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { PaymentRepository } from '../../../repository/paymentRepository';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { getCache, setCache } from '../../../utils/cache';
import { setAuditData } from '../../../helpers/auditHelper';

export default class GetPaymentsInfo {
  public static async getPaymentsInfo(
    req: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { id } = req.params as { id: string };
    const paymentId = parseInt(id, 10);

    const idSchema = Joi.number().integer().min(1).required();
    const { error } = idSchema.validate(paymentId);

    if (error) {
      return reply.status(400).send({ error: 'Invalid payment id' });
    }

    try {
      const cacheKey = `payment:${paymentId}`;

      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send(cached);

      const payments = await PaymentRepository.findById(paymentId);

      if (!payments) {
        return reply.status(404).send({ error: 'Payment not found' });
      }

      await setCache(cacheKey, payments, 60);

      setAuditData(req, paymentId, 'GET_PAYMENT_BY_ID', true, {
        paymentId: id,
      });

      await auditLogMiddleware(req, reply);
      return reply.status(200).send({ data: payments });
    } catch (err) {
      console.error('Error fetching payment info:', err);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
