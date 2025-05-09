import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { PropertyStatus } from '@prisma/client';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { AddressRepository } from '../../../repository/adressRepository';
import { UserRepository } from '../../../repository/userRepository';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { JwtUtils } from '../../../utils/jwt';
import { createPropertyRequestDTO } from './createProperyDTO';
import { GetCordinatesFromAddress } from '../../../service/getCordinatesFromAddress';

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
    .valid(PropertyStatus.AVAILABLE, PropertyStatus.SOLD, PropertyStatus.RENTED)
    .required(),
  images: Joi.array().items(Joi.string()).optional(),
});

export class CreatePropertyController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { error, value } = propertySchema.validate(req.body);
      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = JwtUtils.verifyToken(token);
      if (!decoded) {
        return reply.status(401).send({ error: 'Invalid token' });
      }

      const files = req.files
        ? Array.isArray(req.files)
          ? req.files
          : [req.files]
        : [];

      const imageUrls = files.map((file) => `.././uploads/${file.name}`);

      const data: createPropertyRequestDTO = value;

      const user = await UserRepository.findById(decoded.userId);
      if (user === null || user === undefined) {
        return reply.status(400).send({ error: 'User not found' });
      }

      const addressUrl = `${data.street}, ${data.city}, ${data.state}`;

      const coords =
        await GetCordinatesFromAddress.getCoordinatesFromAddress(addressUrl);
      if (!coords) {
        return reply.status(404).send('Address not found, cordenate invalid');
      }

      const address = await AddressRepository.create({
        street: data.street,
        city: data.city,
        latitude: coords.lat,
        longitude: coords.lon,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      });

      const property = await PropertyRepository.create({
        title: data.title,
        description: data.description,
        price: data.price,
        area: data.area,
        status: data.status as PropertyStatus,
        user: {
          connect: { id: decoded.userId },
        },
        address: {
          connect: { id: address.id },
        },
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      });

      setAuditData(req, decoded.userId, 'CREATE_PROPERTY', true, {
        userId: decoded.userId,
        propertyName: data.title,
        propertyCity: data.city,
      });

      await auditLogMiddleware(req, reply);

      return reply.status(201).send(property);
    } catch (err) {
      console.error('Error creating property:', err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
