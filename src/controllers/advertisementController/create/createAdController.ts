import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { AdVisibility, Prisma } from '@prisma/client';

import { AdRepository } from '../../../repository/advertisementRepository';
import { UserRepository } from '../../../repository/userRepository';
import { PropertyRepository } from '../../../repository/propertyRepository';

import { createAdDTO } from './createAdDTO';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { JwtUtils } from '../../../utils/jwt';
import { envConfig } from '../../../config/envConfig';
import { OrganizationRepository } from '../../../repository/organizationRepository';
import { OrganizationUserRepository } from '../../../repository/organizationUserRepository';

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
      organizationId: Joi.number().min(1).optional(),
      description: Joi.string().min(10).required(),
      adType: Joi.string().valid('RENT', 'SALE').required(),
      price: Joi.number().optional(),
    });

    const { error, value: data } = adSchema.validate(req.body);

    if (error) {
      reply
        .status(422)
        .send({ error: `Validation error: ${error.details[0].message}` });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      reply
        .status(401)
        .send({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtils.verifyToken(token, envConfig.JWT_SECRET);

    if (!decoded || decoded.userId === undefined) {
      reply.status(401).send({ error: 'Invalid or expired token' });
      return;
    }

    const userId = decoded.userId;

    try {
      const property = await PropertyRepository.findById(data.propertyId);
      if (!property) {
        reply.status(404).send({ error: 'Property not found' });
        return;
      }

      const user = await UserRepository.findById(userId);
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }

      let organization;
      if (data.organizationId !== undefined && data.organizationId !== null) {
        organization = await OrganizationRepository.findById(
          data.organizationId,
        );

        if (!organization) {
          return reply.status(404).send({ error: 'Organization not found' });
        }

        const alreadyInOrganization =
          await OrganizationUserRepository.alreadyInOrg(
            userId,
            data.organizationId,
          );

        if (
          !alreadyInOrganization ||
          alreadyInOrganization.id !== organization.id
        ) {
          return reply.status(403).send({
            error: 'User does not belong to the specified organization',
          });
        }

        const orgProperty = await PropertyRepository.findById(data.propertyId);
        if (orgProperty) {
          if (orgProperty.organizationId === null) {
            return reply.status(403).send({
              error:
                'Cannot create an organizational ad for a property without organization',
            });
          }

          if (orgProperty.organizationId !== data.organizationId) {
            return reply.status(409).send({
              error: 'Property already assigned to another organization',
            });
          }
        }
      }
      const adProperty = await AdRepository.findAdByPropertyId(data.propertyId);
      if (adProperty) {
        return reply.status(409).send({
          error: 'Property is already listed in an advertisement',
        });
      }

      const adData: Prisma.AdCreateInput = {
        property: { connect: { id: data.propertyId } },
        user: { connect: { id: userId } },
        title: data.title,
        visibility: data.visibility as AdVisibility,
        description: data.description,
        adType: data.adType,
        price: data.price,
        ...(data.organizationId && {
          organization: { connect: { id: data.organizationId } },
        }),
      };

      const newAd = await AdRepository.create(adData);

      setAuditData(req, null, 'CREATE_AD', true, { email: user.email });
      await auditLogMiddleware(req, reply);

      reply.status(201).send(newAd);
    } catch (err) {
      console.error('[CreateAdController Error]', err);
      reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
