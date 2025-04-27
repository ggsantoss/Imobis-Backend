import { FastifyReply, FastifyRequest } from 'fastify';
import { PropertyRepository } from '../../../repository/propertyRepository';
import Joi from 'joi';
import { getCache, setCache } from '../../../utils/cache';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

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

      const cacheKey = `property:${propertyId}`;

      const cached = await getCache(cacheKey);
      if (cached) return reply.status(200).send(cached);

      const property = await PropertyRepository.findById(propertyId);

      if (!property) {
        return reply.status(404).send({ error: 'Property not found' });
      }

      await setCache(cacheKey, property, 300);

      setAuditData(req, propertyId, 'GET_PROPERTY_BY_ID', true, {
        propertyId: propertyId,
        propertyName: property.title,
      });

      await auditLogMiddleware(req, reply);

      return reply.status(200).send(property);
    } catch (err) {
      console.error('Error fetching property:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
