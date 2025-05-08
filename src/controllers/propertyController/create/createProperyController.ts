import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { createPropertyRequestDTO } from './createProperyDTO';
import { PropertyStatus } from '@prisma/client';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { AddressRepository } from '../../../repository/adressRepository';
import { UserRepository } from '../../../repository/userRepository';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class createPropertyController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const propertySchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().optional(),
      country: Joi.string().required(),
      area: Joi.number().required(),
      status: Joi.string()
        .valid(
          PropertyStatus.AVAILABLE,
          PropertyStatus.SOLD,
          PropertyStatus.RENTED,
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

      const files = req.files
        ? Array.isArray(req.files)
          ? req.files
          : [req.files]
        : [];

      if (files === null) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const imageUrl = files.map((file) => `.././uploads/${file.name}`);

      const data: createPropertyRequestDTO = value;

      const findUser = await UserRepository.findById(data.userId);

      if (!findUser) {
        return reply.status(400).send({ message: 'User not found ' });
      }

      const newAdress = await AddressRepository.create({
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      });

      const newProperty = await PropertyRepository.create({
        title: data.title,
        description: data.description,
        price: data.price,
        area: data.area,
        status: data.status as PropertyStatus,
        user: {
          connect: { id: data.userId },
        },
        address: {
          connect: { id: newAdress.id },
        },
        images: {
          create: imageUrl.map((url) => ({ url })),
        },
      });
      setAuditData(req, data.userId, 'CREATE_PROPERTY', true, {
        userId: data.userId,
        propertyName: data.title,
        propertyCity: data.city,
      });

      await auditLogMiddleware(req, reply);

      reply.status(201).send(newProperty);
    } catch (err) {
      console.error('Error creating property:', err);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
