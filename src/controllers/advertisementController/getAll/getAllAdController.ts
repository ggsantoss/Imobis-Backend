import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';

export class GetAllAdController {
  static async getAllAd(req: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = '1',
        limit = '10',
        tipoAnuncio,
        minPrice,
        maxPrice,
        userId,
        imovelId,
      } = req.query as {
        page?: string;
        limit?: string;
        tipoAnuncio?: string;
        minPrice?: string;
        maxPrice?: string;
        userId?: string;
        imovelId?: string;
      };

      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);

      const filters = {
        page: pageNumber,
        limit: limitNumber,
        tipoAnuncio: tipoAnuncio as any,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        userId: userId ? parseInt(userId, 10) : undefined,
        imovelId: imovelId ? parseInt(imovelId, 10) : undefined,
      };

      const { anuncios, total, totalPages } =
        await AnuncioRepository.getAllAnuncios(filters);

      return reply.send({
        data: anuncios,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      return reply.status(500).send({ error: 'Error fetching properties' });
    }
  }
}
