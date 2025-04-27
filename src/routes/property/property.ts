import { FastifyInstance } from 'fastify';
import { createPropertyController } from '../../controllers/propertyController/create/createProperyController';
import { DeletePropertyController } from '../../controllers/propertyController/delete/deletePropertyController';
import { GetAllPropertiesController } from '../../controllers/propertyController/getAll/getAllPropertiesController';
import { GetPropertyByIdController } from '../../controllers/propertyController/getById/getPropertyByIdController';
import { UpdatePropertyController } from '../../controllers/propertyController/update/updatePropertyController';
import { GetPropertyByUserId } from '../../controllers/propertyController/getByUserId/getPropertyByUserId';

import { authMiddleware } from '../../middleware/authMiddleware';
import { createSchema } from '../../schemas/swagger/property/createSchema';
import { deleteSchema } from '../../schemas/swagger/property/deleteSchema';
import { getAllSchema } from '../../schemas/swagger/property/getAllSchema';
import { getByIdSchema } from '../../schemas/swagger/property/getByIdSchema';
import { getByUserIdSchema } from '../../schemas/swagger/property/getByUserId';
import { updateSchema } from '../../schemas/swagger/property/updateSchema';
// import { updateSchema } from '../../schemas/swagger/property/updateSchema';

export async function propertyRoutes(fastify: FastifyInstance) {
  // Rotas públicas
  fastify.get(
    '/properties',
    { schema: getByUserIdSchema },
    GetAllPropertiesController.getAllProperties,
  );
  fastify.get(
    '/property/:id',
    { schema: getByIdSchema },
    GetPropertyByIdController.getPropertyById,
  );

  // Rotas privadas
  fastify.post(
    '/property',
    { schema: createSchema, preHandler: [authMiddleware] },
    createPropertyController.create,
  );

  fastify.delete(
    '/property/:id',
    { schema: deleteSchema, preHandler: [authMiddleware] },
    DeletePropertyController.deleteProperty,
  );

  fastify.patch(
    '/property/:id',
    { schema: updateSchema, preHandler: [authMiddleware] },
    UpdatePropertyController.update,
  );

  fastify.get(
    '/user/properties/:id',
    { schema: getAllSchema, preHandler: [authMiddleware] },
    GetPropertyByUserId.getPropertyByUserId,
  );
}
