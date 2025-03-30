import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';

export class GetUserByIdController {
  static async getUserById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        return reply.status(400).send({ error: 'Invalid user ID' });
      }

      const getUser = await UserRepository.findById(userId);

      if (getUser) {
        reply.status(200).send(getUser);
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
