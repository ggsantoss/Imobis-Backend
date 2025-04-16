import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';
import { getCache, setCache } from '../../../utils/cache';

export class GetUserByIdController {
  static async getUserById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const userId = parseInt(id, 10);

      const cacheKey = `user:${userId}`;

      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send(cached);

      if (isNaN(userId)) {
        return reply.status(400).send({ error: 'Invalid user ID' });
      }

      const getUser = await UserRepository.findById(userId);

      if (getUser) {
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
