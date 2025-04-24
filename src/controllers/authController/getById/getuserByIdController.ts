import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';
import { getCache, setCache } from '../../../utils/cache';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class GetUserByIdController {
  static async getUserById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        return reply.status(400).send({ error: 'Invalid user ID' });
      }

      const cacheKey = `user:${userId}`;

      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send(cached);

      const getUser = await UserRepository.findById(userId);

      if (getUser) {
        setAuditData(req, userId, 'USER', true, {
          userId: userId,
        });

        await auditLogMiddleware(req, reply);
        await setCache(cacheKey, getUser, 300);
        reply.status(200).send(getUser);
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
