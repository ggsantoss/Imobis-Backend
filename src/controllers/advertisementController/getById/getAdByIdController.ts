import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import { getCache, setCache } from '../../../utils/cache';

export class GetAdByIdController {
  static async getAdById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const adversitementId = parseInt(id, 10);

      if (isNaN(adversitementId)) {
        return reply.status(400).send({ error: 'Invalid advertisement ID' });
      }

      const getAd = await AnuncioRepository.findById(adversitementId);

      const cacheKey = `advertisement:${adversitementId}`;

      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send(cached);

      if (getAd) {
        await setCache(cacheKey, getAd, 300);
        reply.status(200).send(getAd);
      } else {
        reply.status(404).send({ error: 'Advertisement not found' });
      }
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
