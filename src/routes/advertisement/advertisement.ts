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
import { createAdSchema } from '../../schemas/swagger/advertisement/createSchema';
import { getAllSchema } from '../../schemas/swagger/advertisement/getAllSchema';
import { getByIdSchema } from '../../schemas/swagger/advertisement/getByIdSchema';
import { getByUserIdSchema } from '../../schemas/swagger/advertisement/getByUserId';
import { updateSchema } from '../../schemas/swagger/advertisement/updateSchema';
import { softDeleteSchema } from '../../schemas/swagger/advertisement/softDeleteSchema';
import { deleteSchema } from '../../schemas/swagger/advertisement/deleteSchema';

export async function advertisementRoutes(fastify: FastifyInstance) {
  // Rotas públicas
  fastify.get(
    '/advertisements',
    { schema: getAllSchema },
    GetAllAdController.getAllAd,
  );
  fastify.get(
    '/advertisements/:id',
    { schema: getByIdSchema },
    GetAdByIdController.getAdById,
  );
  fastify.get(
    '/users/:id/advertisements',
    { schema: getByUserIdSchema },
    GetAdsByUserId.getAdsByUserId,
  );

  // Rotas privadas
  fastify.post(
    '/advertisements',
    { schema: createAdSchema, preHandler: authMiddleware },
    CreateAdController.createAd,
  );
  fastify.patch(
    '/advertisements/:id',
    { schema: updateSchema, preHandler: authMiddleware },
    UpdateAdController.updateAd,
  );
  fastify.patch(
    '/advertisements/:id/soft-delete',
    { schema: softDeleteSchema, preHandler: authMiddleware },
    SoftDeleteController.softDeleteAd,
  );

  fastify.delete(
    '/advertisements/:id',
    { schema: deleteSchema, preHandler: [authMiddleware, verifyAdmin] },
    DeleteAdController.deleteAd,
  );
}
