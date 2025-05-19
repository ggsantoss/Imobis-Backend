import { FastifyReply, FastifyRequest } from 'fastify';
import { favoriteAdRepository } from '../../../repository/favoriteAdRepository';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class GetAllFavoriteAdController {
  public static async getAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10 } = req.query as {
        page?: number;
        limit?: number;
      };

      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Math.max(Number(limit), 1);
      const skip = (pageNumber - 1) * limitNumber;

      const [favorites, total] = await Promise.all([
        favoriteAdRepository.getAll(limitNumber, skip),
        favoriteAdRepository.countFavoritesAd(),
      ]);

      setAuditData(req, null, 'GET_FAVORITES_AD', true);

      await auditLogMiddleware(req, reply);

      return reply.status(200).send({
        data: favorites,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      });
    } catch (err) {
      console.log('[ERROR] GetAllFavoriteAdController: ' + err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
