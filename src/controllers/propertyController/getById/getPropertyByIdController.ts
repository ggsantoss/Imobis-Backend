import { FastifyReply, FastifyRequest } from 'fastify';
import { PropertyRepository } from '../../../repository/propertyRepository';
import Joi from 'joi';

export class GetPropertyByIdController {
  static async getPropertyById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };

    const idSchema = Joi.number().integer().min(1).required();
    const { error } = idSchema.validate(id);

    if (error) {
      return reply.status(400).send({ error: 'Invalid property ID' });
    }

    try {
      const propertyId = parseInt(id, 10);

      const property = await PropertyRepository.findById(propertyId);

      if (!property) {
        return reply.status(404).send({ error: 'Property not found' });
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
