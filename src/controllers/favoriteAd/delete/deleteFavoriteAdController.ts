import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { favoriteAdRepository } from '../../../repository/favoriteAdRepository';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { JwtUtils } from '../../../utils/jwt';
import { envConfig } from '../../../config/envConfig';

export class DeleteFavoriteAdController {
  public static async delete(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<Response> {
    const schema = Joi.object({
      id: Joi.number().integer().required().messages({
        'number.base': 'id must be a number',
        'number.integer': 'id must be an integer',
        'any.required': 'id is required',
      }),
    });

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtils.verifyToken(token, envConfig.JWT_SECRET);
    if (!decoded || decoded.userId === undefined) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    try {
      const { error, value } = schema.validate(req.params);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const { id } = value as { id: number };

      const ownerFavoriteAd = await favoriteAdRepository.getById(id);

      if (
        ownerFavoriteAd?.userId == decoded.userId ||
        decoded.role == 'ADMIN'
      ) {
        const favoriteDeleted = await favoriteAdRepository.delete(id);

        if (!favoriteDeleted) {
          return reply.status(404).send({ error: 'Property not found' });
        }

        setAuditData(req, id, 'DELETE_FAVORITE_AD', true, {
          adId: id,
        });

        await auditLogMiddleware(req, reply);

        return reply
          .status(204)
          .send({ success: true, message: 'Deleted successfully' });
      }
      return reply.status(401).send({
        error: "You do not have permission to delete someone's else favoriteAd",
      });
    } catch (err) {
      console.log('[ERROR] DeleteFavoriteAdController: ' + err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
