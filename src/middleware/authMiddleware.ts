import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/envConfig';

export function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: Function,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, envConfig.JWT_SECRET, (err, decoded) => {
    if (err) {
      reply.status(403).send({ error: 'Invalid token' });
      return;
    }

    (request as any).user = decoded;
    done();
  });
}
