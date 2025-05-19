import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { favoriteAdRepository } from '../../../repository/favoriteAdRepository';
import { JwtUtils } from '../../../utils/jwt';
import { envConfig } from '../../../config/envConfig';
import { AdRepository } from '../../../repository/advertisementRepository';
import { CreateFavoriteAdRequestDTO } from './createFavoriteAdDTO';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class CreateFavoriteAdController {
  public static async create(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<Response> {
    const favoriteAdSchema = Joi.object({
      adId: Joi.number().id().required(),
    });

    try {
      const { error, value } = favoriteAdSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = JwtUtils.verifyToken(token, envConfig.JWT_SECRET);
      if (!decoded || decoded.userId === undefined) {
        return reply.status(401).send({ error: 'Invalid token' });
      }

      const data: CreateFavoriteAdRequestDTO = value;

      const ad = await AdRepository.findById(data.adId);
      if (!ad) {
        return reply.status(404).send({ error: 'This ad does not exist' });
      }

      const favoriteAd = await favoriteAdRepository.create({
        ad: { connect: { id: ad.id } },
        user: { connect: { id: decoded.userId } },
      });

      if (!favoriteAd) {
        reply.status(400).send({ error: 'Error creating favorite' });
      }

      setAuditData(req, decoded.userId, 'CREATE_FAVORITE_AD', true, {
        userId: decoded.userId,
        favoriteAd: data.adId,
      });

      await auditLogMiddleware(req, reply);

      return reply.status(200).send({
        success: true,
        message: 'Favorited successfully',
        data: favoriteAd,
      });
    } catch (err) {
      console.log('[ERROR] CreateFavoriteAdController: ' + err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
