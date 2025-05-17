import { FastifyInstance } from 'fastify';
import { CreateReviewController } from '../../controllers/reviewController/create/createReviewController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { DeleteReviewController } from '../../controllers/reviewController/delete/deleteReview';
import { GetReviewById } from '../../controllers/reviewController/getById/getReviewById';
import { GetAllReviewsController } from '../../controllers/reviewController/getAll/getAllReviewsController';

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/review',
    { preHandler: [authMiddleware] },
    CreateReviewController.create,
  );

  fastify.delete(
    '/review/:id',
    { preHandler: [authMiddleware, verifyAdmin] },
    DeleteReviewController.delete,
  );

  fastify.get(
    '/review/:id',
    {
      preHandler: [authMiddleware, verifyAdmin],
    },
    GetReviewById.getById,
  );

  fastify.get('/review', GetAllReviewsController.getAllReviews);
}
