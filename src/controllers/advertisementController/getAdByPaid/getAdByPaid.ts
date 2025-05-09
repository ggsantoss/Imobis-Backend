import { FastifyReply, FastifyRequest } from 'fastify';
import { AdRepository } from '../../../repository/advertisementRepository';

export class GetAdByPaid {
  public static async get(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { page = '1', limit = '10' } = req.query as {
        page?: string;
        limit?: string;
      };

      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      if (
        isNaN(pageNumber) ||
        pageNumber <= 0 ||
        isNaN(limitNumber) ||
        limitNumber <= 0
      ) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid page or limit.',
        });
      }

      const ads = await AdRepository.findAdPaid(limitNumber, pageNumber);

      return reply.send({
        success: true,
        data: ads.items,
        pagination: {
          page: ads.page,
          limit: limitNumber,
          total: ads.total,
          totalPages: ads.totalPage,
        },
      });
    } catch (error) {
      console.error('Error fetching paid ads:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal Server Error',
      });
    }
  }
}
