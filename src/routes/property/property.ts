import { FastifyInstance } from 'fastify';
import { createPropertyController } from '../../controllers/propertyController/create/createProperyController';
import { DeletePropertyController } from '../../controllers/propertyController/delete/deletePropertyController';
import { GetAllPropertiesController } from '../../controllers/propertyController/getAll/getAllPropertiesController';
import { GetPropertyByIdController } from '../../controllers/propertyController/getById/getPropertyByIdController';
import { UpdatePropertyController } from '../../controllers/propertyController/update/updatePropertyController';
import { GetPropertyByUserId } from '../../controllers/propertyController/getByUserId/getPropertyByUserId';

import { authMiddleware } from '../../middleware/authMiddleware';

export async function propertyRoutes(fastify: FastifyInstance) {
  // Rotas públicas
  fastify.get('/properties', GetAllPropertiesController.getAllProperties);
  fastify.get('/property/:id', GetPropertyByIdController.getPropertyById);

  // Rotas privadas
  fastify.post(
    '/property',
    { preHandler: [authMiddleware] },
    createPropertyController.create,
  );

  fastify.delete(
    '/property/:id',
    { preHandler: [authMiddleware] },
    DeletePropertyController.deleteProperty,
  );

  fastify.patch(
    '/property/:id',
    { preHandler: [authMiddleware] },
    UpdatePropertyController.update,
  );

  fastify.get(
    '/user/properties/:id',
    { preHandler: [authMiddleware] },
    GetPropertyByUserId.getPropertyByUserId,
  );
}
