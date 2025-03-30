import { FastifyReply, FastifyRequest } from 'fastify';
import { BlacklistRepository } from '../../../repository/blackListRepository';

export class LogoutUserController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return reply.status(401).send({ error: 'Token not provided' });
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return reply.status(401).send({ error: 'Invalid token format' });
      }

      await BlacklistRepository.addToken(token);
      return reply
        .status(200)
        .send({ message: 'Token blacklisted successfully' });
    } catch (error) {
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
