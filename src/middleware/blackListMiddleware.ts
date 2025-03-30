import { FastifyReply, FastifyRequest } from 'fastify';
import { BlacklistRepository } from '../repository/blackListRepository';

export async function blacklistMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return reply.status(401).send({ error: 'Invalid token format' });
    }

    const isBlacklisted = await BlacklistRepository.isTokenBlacklisted(token);

    if (isBlacklisted) {
      return reply.status(403).send({ error: 'Token is blacklisted' });
    }
  } catch (error) {
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
}
