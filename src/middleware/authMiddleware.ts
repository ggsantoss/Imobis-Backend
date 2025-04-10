import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/envConfig';
import { BlacklistRepository } from '../repository/blackListRepository';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    const isBlacklisted = await BlacklistRepository.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return reply.status(403).send({ error: 'Token is blacklisted' });
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET);

    (request as any).user = decoded;
  } catch (err) {
    return reply.status(403).send({ error: 'Invalid or expired token' });
  }
}
