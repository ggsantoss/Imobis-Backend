import { FastifyReply, FastifyRequest } from 'fastify';
import { AdRepository } from '../../../repository/advertisementRepository';
import Joi from 'joi';
import { UpdateAdRequestDTO } from './updateAdDTO';
import { AdVisibility } from '@prisma/client';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class UpdateAdController {
  static async updateAd(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const adId = parseInt(id, 10);

      if (isNaN(adId)) {
        return reply.status(400).send({ error: 'Invalid ad ID' });
      }

      const adSchema = Joi.object({
        title: Joi.string().min(3).optional(),
        description: Joi.string().min(5).optional(),
        adType: Joi.string().valid('RENT', 'SALE').optional(),
        propertyId: Joi.number().optional(),
        userId: Joi.number().optional(),
        price: Joi.number().optional(),
        visibility: Joi.string()
          .valid(...Object.values(AdVisibility))
          .optional(),
      });

      const { error, value } = adSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: UpdateAdRequestDTO = value;

      const updatedAd = await AdRepository.update(adId, data);

      if (!updatedAd) {
        return reply.status(404).send({ error: 'Ad not found' });
      }

      setAuditData(req, adId, 'UPDATE_AD', true, {
        adId,
        userId: data.userId,
      });

      await auditLogMiddleware(req, reply);

      return reply.status(200).send(updatedAd);
    } catch (err) {
      console.error('Error during updateAd:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
