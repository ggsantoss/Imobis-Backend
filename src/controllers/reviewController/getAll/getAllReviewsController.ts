import { FastifyReply, FastifyRequest } from 'fastify';
import { ReviewRepository } from '../../../repository/reviewRepository';

export class GetAllReviewsController {
  public static async getAllReviews(req: FastifyRequest, reply: FastifyReply) {
    const { page = '1', limit = '10' } = req.query as {
      page?: string;
      limit?: string;
    };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      return reply.status(400).send({ error: 'Invalid query parameters' });
    }

    const pageNumber = parsedPage;
    const limitNumber = parsedLimit;
    const skip = (pageNumber - 1) * limitNumber;

    try {
      const reviews = await ReviewRepository.findAll(skip, limitNumber);

      reply.status(200).send({
        success: true,
        message: 'Users found successfully',
        data: reviews,
      });
    } catch (err) {
      console.log('[ERROR] GetAllReviewsController: ' + err);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
