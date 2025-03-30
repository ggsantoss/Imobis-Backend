import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { createPropertyRequestDTO } from './createProperyDTO';
import { ImovelStatus } from '@prisma/client';
import { PropertyRepository } from '../../../repository/propertyRepository';

export class createPropertyController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const propertySchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      address: Joi.string().required(),
      area: Joi.number().required(),
      status: Joi.string()
        .valid(
          ImovelStatus.DISPONIVEL,
          ImovelStatus.VENDIDO,
          ImovelStatus.ALUGADO,
        )
        .required(),
      userId: Joi.number().required(),
      images: Joi.array().items(Joi.string()).optional(),
    });

    try {
      const { error, value } = propertySchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: createPropertyRequestDTO = value;

      const newProperty = await PropertyRepository.create({
        title: data.title,
        description: data.description,
        price: data.price,
        address: data.address,
        area: data.area,
        status: data.status as ImovelStatus,
        user: {
          connect: { id: data.userId },
        },
        images: data.images
          ? {
              create: data.images.map((url) => ({ url })),
            }
          : undefined,
      });

      reply.status(201).send(newProperty);
    } catch (err) {
      console.error('Error creating property:', err); // Adiciona o log do erro
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
