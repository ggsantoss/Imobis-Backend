import { FastifyInstance } from 'fastify';
import { CreateAdController } from '../../controllers/advertisementController/create/createAdController';
import { DeleteAdController } from '../../controllers/advertisementController/delete/deleteAdController';
import { GetAllAdController } from '../../controllers/advertisementController/getAll/getAllAdController';
import { GetAdByIdController } from '../../controllers/advertisementController/getById/getAdByIdController';
import { UpdateAdController } from '../../controllers/advertisementController/update/updateAdController';
import { SoftDeleteController } from '../../controllers/advertisementController/softDelete/softDeleteController';
import { GetAdsByUserId } from '../../controllers/advertisementController/getAdvertisementsByUserId/getAdsByUserId';
import { authMiddleware } from '../../middleware/authMiddleware';
import { verifyAdmin } from '../../middleware/verifyAdmin';

export async function advertisementRoutes(fastify: FastifyInstance) {
  // Rotas públicas
  fastify.get('/advertisements', GetAllAdController.getAllAd);
  fastify.get('/advertisements/:id', GetAdByIdController.getAdById);
  fastify.get('/users/:id/advertisements', GetAdsByUserId.getAdsByUserId);

  // Rotas privadas
  fastify.post(
    '/advertisements',
    { preHandler: authMiddleware },
    CreateAdController.createAd,
  );
  fastify.patch(
    '/advertisements/:id',
    { preHandler: authMiddleware },
    UpdateAdController.updateAd,
  );
  fastify.patch(
    '/advertisements/:id/soft-delete',
    { preHandler: authMiddleware },
    SoftDeleteController.softDeleteAd,
  );

  fastify.delete(
    '/advertisements/:id',
    { preHandler: [authMiddleware, verifyAdmin] },
    DeleteAdController.deleteAd,
  );
}
