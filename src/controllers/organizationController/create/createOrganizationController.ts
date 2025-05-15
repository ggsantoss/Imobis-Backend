import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateOrganizationRequestDTO } from './createOrganizationDTO';
import Joi from 'joi';
import { OrganizationRepository } from '../../../repository/organizationRepository';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { OrganizationUserRepository } from '../../../repository/organizationUserRepository';
import { JwtUtils } from '../../../utils/jwt';
import { envConfig } from '../../../config/envConfig';

export class CreateOrganizationController {
  public static async create(req: FastifyRequest, reply: FastifyReply) {
    const orgSchema = Joi.object<CreateOrganizationRequestDTO>({
      name: Joi.string().min(5).max(100),
    });

    const { error, value: data } = orgSchema.validate(req.body);

    if (error) {
      return reply.status(400).send({ error: error.details[0].message });
    }

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const tokenUser = authHeader.split(' ')[1];

      const decoded = await JwtUtils.verifyToken(
        tokenUser,
        envConfig.JWT_SECRET,
      );
      if (!decoded || decoded === undefined) {
        return reply.status(404).send({ error: 'User Not found' });
      }

      if (typeof decoded.userId !== 'number') {
        throw new Error('Invalid user');
      }
      const newOrganization = await OrganizationRepository.create(data);

      await OrganizationUserRepository.create({
        user: { connect: { id: decoded.userId } },
        organization: { connect: { id: newOrganization.id } },
        role: 'ADMIN',
      });

      setAuditData(req, null, 'CREATE_ORG', true, { name: data.name });
      await auditLogMiddleware(req, reply);

      reply.status(201).send({
        success: true,
        message: 'Organization created successfully',
        data: newOrganization,
      });
    } catch (err) {
      console.log('[CreateOrganizationController Error]', err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
