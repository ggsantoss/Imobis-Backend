import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { AnuncioRepository } from '../../../repository/advertisementRepository';

export class GetAdsByUserId {
  static async getAdsByUserId(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const idSchema = Joi.number().integer().min(1).required();
    const { error } = idSchema.validate(id);

    if (error) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const userId = parseInt(id, 10);

      const advertisement = await AnuncioRepository.getAdsByUserId(userId);

      if (!advertisement) {
        return reply
          .status(404)
          .send({ error: 'The user do not have any advertisement' });
      }

      return reply.status(200).send(advertisement);
    } catch (err) {
      console.error('Error fetching advertisement:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
