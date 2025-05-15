import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/authMiddleware';
import { CreateOrganizationController } from '../../controllers/organizationController/create/createOrganizationController';
import { SendOrgInviteController } from '../../controllers/organizationController/sendOrgInvite/sendOrgInviteController';
import { AddToOrgController } from '../../controllers/organizationController/addToOrg/addToOrgController';
import { UpdateRoleController } from '../../controllers/organizationController/updateRole/updateRoleController';

export async function organizationRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/organization',
    { preHandler: authMiddleware },
    CreateOrganizationController.create,
  );

  fastify.post(
    '/organization/invite/send',
    { preHandler: authMiddleware },
    SendOrgInviteController.send,
  );

  fastify.post(
    '/organization/invite/:token',
    { preHandler: authMiddleware },
    AddToOrgController.add,
  );

  fastify.patch(
    '/organization/:id/updateRole',
    { preHandler: authMiddleware },
    UpdateRoleController.update,
  );
}
