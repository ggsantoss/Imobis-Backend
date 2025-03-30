import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import Joi from 'joi';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class DeleteAdController {
  static async deleteAd(req: FastifyRequest, reply: FastifyReply) {
    const schema = Joi.object({
      id: Joi.number().integer().required().messages({
        'number.base': 'id must be a number',
        'number.integer': 'id must be an integer',
        'any.required': 'id is required',
      }),
    });

    try {
      const { error, value } = schema.validate(req.params);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const { id } = value as { id: number };

      const deletedProperty = await AnuncioRepository.delete(id);

      if (!deletedProperty) {
        return reply.status(404).send({ error: 'Property not found' });
      }

      return reply
        .status(200)
        .send({ message: 'Advertisement deleted successfully' });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        return reply.status(404).send({ error: 'Advertisement not found' });
      }

      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
