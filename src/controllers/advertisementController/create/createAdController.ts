import { FastifyReply, FastifyRequest } from 'fastify';
import { AdRepository } from '../../../repository/advertisementRepository';
import Joi from 'joi';
import { createAdDTO } from './createAdDTO';
import { UserRepository } from '../../../repository/userRepository';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { AdVisibility } from '@prisma/client';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class CreateAdController {
  static async createAd(req: FastifyRequest, reply: FastifyReply) {
    const adSchema = Joi.object({
      propertyId: Joi.number().integer().min(1).required(),
      userId: Joi.number().integer().min(1).required(),
      title: Joi.string().min(3).required(),
      visibility: Joi.string().valid(...Object.values(AdVisibility)).required(),
      description: Joi.string().min(10).required(),
      adType: Joi.string().valid('RENT', 'SALE').required(),
      price: Joi.number().optional(),
    });

    try {
      const { error, value } = adSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: createAdDTO = value;

      const imovelExists = await PropertyRepository.findById(data.propertyId);
      if (!imovelExists) {
        return reply.status(400).send({ error: 'Property not found' });
      }

      const userExists = await UserRepository.findById(data.userId);
      if (!userExists) {
        return reply.status(400).send({ error: 'User not found' });
      }

      const visibility = data.visibility as AdVisibility;

      const newAd = await AdRepository.create({
        property: { connect: { id: data.propertyId } },
        user: { connect: { id: data.userId } },
        title: data.title,
        visibility,
        description: data.description,
        adType: data.adType,
        price: data.price,
      });

      setAuditData(req, null, 'CREATE_AD', true, {
        email: userExists.email,
      });

      await auditLogMiddleware(req, reply);

      reply.status(201).send(newAd);
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
