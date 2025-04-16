import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import { getCache, setCache } from '../../../utils/cache';

export class GetAdsByUserId {
  static async getAdsByUserId(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const userId = parseInt(id, 10);

    const idSchema = Joi.number().integer().min(1).required();
    const { error } = idSchema.validate(userId);

    if (error) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const advertisement = await AnuncioRepository.getAdsByUserId(userId);

      if (!advertisement || advertisement.length === 0) {
        return reply
          .status(404)
          .send({ error: 'The user does not have any advertisements' });
      }

      const cacheKey = `user:${userId}:ads`;

      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send(cached);

      await setCache(cacheKey, advertisement, 60);

      return reply.status(200).send(advertisement);
    } catch (err) {
      console.error('Error fetching advertisement:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
