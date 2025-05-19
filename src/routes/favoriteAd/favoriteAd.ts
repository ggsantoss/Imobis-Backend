import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/authMiddleware';
import { CreateFavoriteAdController } from '../../controllers/favoriteAd/create/createFavoriteAdController';
import { DeleteFavoriteAdController } from '../../controllers/favoriteAd/delete/deleteFavoriteAdController';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { GetAllFavoriteAdController } from '../../controllers/favoriteAd/getAll/getAllFavoriteAdController';
import { GetAllFavoriteAdFromUserController } from '../../controllers/favoriteAd/getAllFromUser/getAllFavoriteAdFromUserController';
// import { GetFavoriteAdByIdController } from '../../controllers/favoriteAd/getById/getFavoriteAdByIdController';

export async function favoriteAdRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/favorite',
    { preHandler: authMiddleware },
    CreateFavoriteAdController.create,
  );

  fastify.delete(
    '/favorite',
    { preHandler: authMiddleware }, // Já tem a autorização de admin no controller
    DeleteFavoriteAdController.delete,
  );

  // fastify.get(
  //   '/favorite/:id',
  //   { preHandler: [authMiddleware, verifyAdmin] },
  //   GetFavoriteAdByIdController.
  // );

  fastify.get(
    '/favorite',
    { preHandler: [authMiddleware, verifyAdmin] },
    GetAllFavoriteAdController.getAll,
  );

  fastify.get(
    '/favorite/user/:id',
    { preHandler: [authMiddleware] },
    GetAllFavoriteAdFromUserController.getAllFromUser,
  );
}
