import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';

export class GetAllUsersController {
  static async getUsers(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = '1', limit = '10' } = req.query as {
        page?: string;
        limit?: string;
      };

      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);

      if (
        isNaN(parsedPage) ||
        isNaN(parsedLimit) ||
        parsedPage < 1 ||
        parsedLimit < 1
      ) {
        return reply.status(400).send({ error: 'Invalid query parameters' });
      }

      const pageNumber = parsedPage;
      const limitNumber = parsedLimit;
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
