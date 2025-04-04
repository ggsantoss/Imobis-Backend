import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import { TipoAnuncio } from '@prisma/client';

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

      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
      const filters = {
        page: pageNumber,
        limit: limitNumber,
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

      return reply.send({
        success: true,
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
      return reply.status(500).send({
        success: false,
        error: 'Erro ao buscar anúncios. Tente novamente mais tarde.',
      });
    }
  }
}
