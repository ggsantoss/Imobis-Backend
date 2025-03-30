import { FastifyInstance } from 'fastify';
import { createPropertyController } from '../../controllers/propertyController/create/createProperyController';
import { DeletePropertyController } from '../../controllers/propertyController/delete/deletePropertyController';
import { GetAllPropertiesController } from '../../controllers/propertyController/getAll/getAllPropertiesController';
import { GetPropertyByIdController } from '../../controllers/propertyController/getById/getPropertyByIdController';
import { UpdatePropertyController } from '../../controllers/propertyController/update/updatePropertyController';
import { blacklistMiddleware } from '../../middleware/blackListMiddleware';

export async function propertyRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/property',
    { preHandler: blacklistMiddleware },
    createPropertyController.create,
  );
  fastify.delete('/property/:id', DeletePropertyController.deleteProperty);
  fastify.get('/properties', GetAllPropertiesController.getAllProperties);
  fastify.get('/property/:id', GetPropertyByIdController.getPropertyById);
  fastify.patch('/property/:id', UpdatePropertyController.update);
}
