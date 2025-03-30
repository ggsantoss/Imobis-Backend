import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';

export class GetAllUsersController {
  static async getUsers(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = '1', limit = '10' } = req.query as {
        page?: string;
        limit?: string;
      };

      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const users = await UserRepository.getAllUsers(limitNumber, skip);
      const totalUsers = await UserRepository.countUsers();

      reply.status(200).send({
        data: users,
        pagination: {
          total: totalUsers,
          page: pageNumber,
          perPage: limitNumber,
          totalPages: Math.ceil(totalUsers / limitNumber),
        },
      });
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
