import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import { TipoAnuncio } from '@prisma/client';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

export class GetAllAdController {
  static async getAllAd(req: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = '1',
        limit = '10',
        tipoAnuncio,
        tipoImovel,
        city,
        minPrice,
        maxPrice,
        userId,
        imovelId,
      } = req.query as {
        page?: string;
        limit?: string;
        tipoAnuncio?: string;
        tipoImovel?: string;
        city?: string;
        minPrice?: string;
        maxPrice?: string;
        userId?: string;
        imovelId?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (isNaN(pageNumber) || pageNumber <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid page or limit',
        });
      }

      if (isNaN(limitNumber) || limitNumber <= 0) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid page or limit',
        });
      }

      const filters = {
        page: Math.max(pageNumber, 1),
        limit: Math.max(limitNumber, 1),
        tipoAnuncio: tipoAnuncio
          ? (tipoAnuncio.trim() as keyof typeof TipoAnuncio)
          : undefined,
        tipoImovel: tipoImovel || undefined,
        city: city || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        userId: userId ? parseInt(userId, 10) : undefined,
        imovelId: imovelId ? parseInt(imovelId, 10) : undefined,
      };

      const { anuncios, total, totalPages } =
        await AnuncioRepository.getAllAnuncios(filters);

      setAuditData(req, null, 'GET_ALL_ADS', true);

      await auditLogMiddleware(req, reply);

      return reply.send({
        success: true,
        data: anuncios,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      return reply.status(500).send({
        success: false,
        error: 'Error fetching ads. Please try again later.',
      });
    }
  }
}
