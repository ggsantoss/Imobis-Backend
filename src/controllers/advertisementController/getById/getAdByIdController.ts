import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import { getCache, setCache } from '../../../utils/cache';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class GetAdByIdController {
  static async getAdById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const advertisementId = parseInt(id, 10);

      if (isNaN(advertisementId)) {
        return reply.status(400).send({ error: 'Invalid advertisement ID' });
      }

      const cacheKey = `advertisement:${advertisementId}`;
      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send({ data: cached });

      const getAd = await AnuncioRepository.findById(advertisementId);

      if (getAd) {
        await setCache(cacheKey, getAd, 300);

        setAuditData(req, getAd.id, 'GET_AD_BY_ID', true, {
          advertisementId: id,
        });

        await auditLogMiddleware(req, reply);

        return reply.status(200).send({ data: getAd });
      } else {
        return reply.status(404).send({ error: 'Advertisement not found' });
      }
    } catch (err) {
      reply.status(500).send({
        error: 'Something went wrong',
        details: (err as Error).message,
      });
    }
  }
}
