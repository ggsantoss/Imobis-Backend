import { FastifyReply, FastifyRequest } from 'fastify';
import { favoriteAdRepository } from '../../../repository/favoriteAdRepository';
import { envConfig } from '../../../config/envConfig';
import { JwtUtils } from '../../../utils/jwt';

export class GetAllFavoriteAdFromUserController {
  public static async getAllFromUser(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<Response> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtils.verifyToken(token, envConfig.JWT_SECRET);
    if (!decoded || decoded.userId === undefined) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const { page = 1, limit = 10 } = req.query as {
      page?: number;
      limit?: number;
    };

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    try {
      const [favorites, total] = await Promise.all([
        favoriteAdRepository.getAllFromUser(decoded.userId, limitNumber, skip),
        favoriteAdRepository.countFavoritesAd(),
      ]);

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
      console.log('[ERROR] GetAllFavoriteAdFromUserController: ' + err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
