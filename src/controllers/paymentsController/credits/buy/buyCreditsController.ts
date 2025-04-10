import { FastifyReply, FastifyRequest } from 'fastify';
import { buyCreditsRequestDTO } from './buyCreditsDTO';
import Joi from 'joi';
import { prisma } from '../../../../db/prisma';
import { UserRepository } from '../../../../repository/userRepository';
import { CreditsRepository } from '../../../../repository/creditsRepository';
import { preference } from '../../../../service/mercadopagoService';
import { PaymentRepository } from '../../../../repository/paymentRepository';

export class BuyCreditsController {
  static async buy(req: FastifyRequest, reply: FastifyReply) {
    const userSchema = Joi.object({
      userId: Joi.number().required(),
      balance: Joi.number().required(),
    });

    try {
      const { error, value } = userSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }
      const data: buyCreditsRequestDTO = value;

      if (data.balance <= 0) {
        return reply.status(400).send({ message: 'Invalid balance' });
      }

      const user = await UserRepository.findById(data.userId);

      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      const external_reference = `user_${data.userId}`;

      const response = await preference.create({
        body: {
          items: [
            {
              id: '1',
              title: 'Compra de Créditos',
              quantity: 1,
              unit_price: data.balance,
            },
          ],
          back_urls: {
            success: 'http://localhost:3000/payments/credits/notification',
            failure: '',
            pending: '',
          },
          auto_return: 'approved',
          external_reference: external_reference,
        },
      });

      const initPoint = response.init_point;

      const existingCredits = await CreditsRepository.findByUserId(data.userId);

      if (!existingCredits) {
        await CreditsRepository.newCredits(data.userId, 0);
      }

      const getCredits = await CreditsRepository.findByUserId(data.userId);

      await PaymentRepository.create({
        amount: data.balance,
        status: 'PENDING',
        credits: {
          connect: { id: getCredits?.id },
        },
        user: {
          connect: { id: data.userId },
        },
        externalReference: external_reference,
      });

      reply.send({ status: 'success', initPoint });
    } catch (err) {
      reply.status(500).send({
        status: 'error',
        message: 'Error creating payment preference',
        error: err || err,
      });
    }
  }
}
