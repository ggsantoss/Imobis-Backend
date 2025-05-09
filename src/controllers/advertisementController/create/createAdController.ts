import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { AdVisibility } from '@prisma/client';

import { AdRepository } from '../../../repository/advertisementRepository';
import { UserRepository } from '../../../repository/userRepository';
import { PropertyRepository } from '../../../repository/propertyRepository';

import { createAdDTO } from './createAdDTO';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { JwtUtils } from '../../../utils/jwt';

export class CreateAdController {
  static async createAd(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const adSchema = Joi.object<createAdDTO>({
      propertyId: Joi.number().integer().min(1).required(),
      title: Joi.string().min(3).required(),
      visibility: Joi.string()
        .valid(...Object.values(AdVisibility))
        .required(),
      description: Joi.string().min(10).required(),
      adType: Joi.string().valid('RENT', 'SALE').required(),
      price: Joi.number().optional(),
    });

    const { error, value: data } = adSchema.validate(req.body);

    if (error) {
      reply.status(400).send({ error: error.details[0].message });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtils.verifyToken(token);

    if (!decoded) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const userId = decoded.userId;

    try {
      const property = await PropertyRepository.findById(data.propertyId);
      if (!property) {
        reply.status(400).send({ error: 'Property not found' });
        return;
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        reply.status(400).send({ error: 'User not found' });
        return;
      }

      const newAd = await AdRepository.create({
        property: { connect: { id: data.propertyId } },
        user: { connect: { id: userId } },
        title: data.title,
        visibility: data.visibility as AdVisibility,
        description: data.description,
        adType: data.adType,
        price: data.price,
      });

      setAuditData(req, null, 'CREATE_AD', true, { email: user.email });
      await auditLogMiddleware(req, reply);

      reply.status(201).send(newAd);
    } catch (err) {
      console.error('[CreateAdController Error]', err);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
