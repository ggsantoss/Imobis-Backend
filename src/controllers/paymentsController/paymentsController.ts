import { FastifyReply, FastifyRequest } from 'fastify';
import { PaymentRepository } from '../../repository/paymentRepository';
import Joi from 'joi';
import { CreatePaymentRequestDTO } from './createPaymentDTO';
import { preference } from '../../service/mercadopagoService';

export class PaymentController {
  static async newPayment(req: FastifyRequest, reply: FastifyReply) {
    const paymentSchema = Joi.object({
      amount: Joi.number().min(0).required(),
      status: Joi.string().valid('PENDING', 'APPROVED', 'FAILED').required(),
      anuncioId: Joi.number().integer().min(1).required(),
      userId: Joi.number().integer().min(1).required(),
      email: Joi.string().email().required(),
    });

    try {
      const { error, value } = paymentSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: CreatePaymentRequestDTO = value;
      const response = await preference.create({
        body: {
          items: [
            {
              id: '1',
              title: 'Ad',
              quantity: 1,
              unit_price: data.amount,
            },
          ],
          payer: {
            email: data.email,
          },
          back_urls: {
            success: 'http://localhost:3000/payment/notification',
            failure: 'http://localhost:3000/payment/notification',
            pending: 'http://localhost:3000/payment/notification',
          },
          auto_return: 'approved',
        },
      });

      const externalReference = `order_${Date.now()}_${data.userId}`;

      await PaymentRepository.create({
        amount: data.amount,
        status: 'PENDING',
        anuncio: {
          connect: { id: data.anuncioId },
        },
        user: {
          connect: { id: data.userId },
        },
        externalReference: externalReference,
      });

      console.log('Preference created successfully:', response);

      const initPoint = response.init_point;
      console.log('Redirecting to the payment link:', initPoint);

      reply.send({ status: 'success', initPoint });
    } catch (error) {
      console.error('Error creating preference:', error);
      reply.status(500).send({
        status: 'error',
        message: 'Error creating payment preference',
      });
    }
  }
}
