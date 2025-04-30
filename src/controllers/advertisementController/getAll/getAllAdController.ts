import { FastifyReply, FastifyRequest } from 'fastify';
import { AdRepository } from '../../../repository/advertisementRepository';
import { AdType } from '@prisma/client';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class GetAllAdController {
  static async getAllAd(req: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = '1',
        limit = '10',
        adType,
        propertyType,
        city,
        minPrice,
        maxPrice,
        userId,
        propertyId,
      } = req.query as {
        page?: string;
        limit?: string;
        adType?: string;
        propertyType?: string;
        city?: string;
        minPrice?: string;
        maxPrice?: string;
        userId?: string;
        propertyId?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid page or limit.',
        });
      }

      if (isNaN(limitNumber) || limitNumber <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid page or limit.',
        });
      }

      const filters = {
        page: Math.max(pageNumber, 1),
        limit: Math.max(limitNumber, 1),
        adType: adType ? (adType.trim() as keyof typeof AdType) : undefined,
        propertyType: propertyType || undefined,
        city: city || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        userId: userId ? parseInt(userId, 10) : undefined,
        propertyId: propertyId ? parseInt(propertyId, 10) : undefined,
      };

      const { ads, total, totalPages } = await AdRepository.getAllAds(filters);

      setAuditData(req, null, 'GET_ALL_ADS', true);

      await auditLogMiddleware(req, reply);

      return reply.send({
        success: true,
        data: ads,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching ads:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error fetching ads. Please try again later.',
      });
    }
  }
}
