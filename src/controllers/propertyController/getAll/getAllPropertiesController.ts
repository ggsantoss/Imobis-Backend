import { FastifyReply, FastifyRequest } from 'fastify';
import { PropertyRepository } from '../../../repository/propertyRepository';

export class GetAllPropertiesController {
  static async getAllProperties(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = 1, limit = 10 } = req.query as {
        page?: number;
        limit?: number;
      };

      const pageNumber = Math.max(Number(page), 1);
      const limitNumber = Math.max(Number(limit), 1);
      const skip = (pageNumber - 1) * limitNumber;

      const [properties, total] = await Promise.all([
        PropertyRepository.getAllProperties(limitNumber, skip),
        PropertyRepository.countProperties(),
      ]);

      return reply.send({
        data: properties,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error) {
      return reply.status(500).send({ error: 'Error fetching properties' });
    }
  }
}
