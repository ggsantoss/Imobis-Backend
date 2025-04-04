import { FastifyReply, FastifyRequest } from 'fastify';
import { PropertyRepository } from '../../../repository/propertyRepository';
import Joi from 'joi';

export class GetPropertyByUserId {
  static async getPropertyByUserId(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const idSchema = Joi.number().integer().min(1).required();
    const { error } = idSchema.validate(id);

    if (error) {
      return reply.status(400).send({ error: 'Invalid user ID' });
    }

    try {
      const userId = parseInt(id, 10);

      const property = await PropertyRepository.getPropertyByUserId(userId);

      if (!property) {
        return reply
          .status(404)
          .send({ error: 'The user do not have any property' });
      }

      return reply.status(200).send(property);
    } catch (err) {
      console.error('Error fetching property:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
