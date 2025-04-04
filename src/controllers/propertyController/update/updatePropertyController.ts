import { FastifyReply, FastifyRequest } from 'fastify';
import { PropertyRepository } from '../../../repository/propertyRepository';
import Joi from 'joi';
import { updatePropertyRequestDTO } from './updatePropertyDTO';
import { ImovelStatus } from '@prisma/client';

export class UpdatePropertyController {
  static async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string };
    const propertyId = parseInt(id, 10);

    const propertySchema = Joi.object({
      title: Joi.string().min(3).optional(),
      description: Joi.string().min(5).optional(),
      price: Joi.number().optional(),
      imovelId: Joi.number().optional(),
      userId: Joi.number().optional(),
      status: Joi.string()
        .valid(...Object.values(ImovelStatus))
        .optional(),
    });

    const { error, value } = propertySchema.validate(req.body);

    if (error) {
      return reply.status(400).send({ error: error.details[0].message });
    }

    const data: updatePropertyRequestDTO = value;

    try {
      const existingProperty = await PropertyRepository.findById(propertyId);

      if (!existingProperty) {
        return reply.status(404).send({ error: 'Property not found' });
      }

      const updatedProperty = await PropertyRepository.update(propertyId, data);

      return reply.status(200).send(updatedProperty);
    } catch (err) {
      console.error('Error updating property:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
