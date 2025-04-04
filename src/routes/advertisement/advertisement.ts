import { FastifyInstance } from 'fastify';
import { CreateAdController } from '../../controllers/advertisementController/create/createAdController';
import { DeleteAdController } from '../../controllers/advertisementController/delete/deleteAdController';
import { GetAllAdController } from '../../controllers/advertisementController/getAll/getAllAdController';
import { GetAdByIdController } from '../../controllers/advertisementController/getById/getAdByIdController';
import { UpdateAdController } from '../../controllers/advertisementController/update/updateAdController';
import { SoftDeleteController } from '../../controllers/advertisementController/softDelete/softDeleteController';
import { GetAdsByUserId } from '../../controllers/advertisementController/getAdvertisementsByUserId/getAdsByUserId';

export async function advertisementRoutes(fastify: FastifyInstance) {
  fastify.post('/advertisement', CreateAdController.createAd);
  fastify.delete('/advertisement/:id', DeleteAdController.deleteAd);
  fastify.get('/advertisements', GetAllAdController.getAllAd);
  fastify.get('/advertisement/:id', GetAdByIdController.getAdById);
  fastify.patch('/advertisement/:id', UpdateAdController.updateAd);
  fastify.post(
    '/advertisement/soft_delete/:id',
    SoftDeleteController.softDeleteAd,
  );
  fastify.get('/user/advertisements/:id', GetAdsByUserId.getAdsByUserId);
}
