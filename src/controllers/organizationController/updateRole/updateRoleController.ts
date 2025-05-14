import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { UpdateRoleRequestDTO } from './updateRoleDTO';
import { OrganizationUserRepository } from '../../../repository/organizationUserRepository';
import { envConfig } from '../../../config/envConfig';
import { JwtUtils } from '../../../utils/jwt';
import { Role } from '@prisma/client';
import { setAuditData } from '../../../helpers/auditHelper';

export class UpdateRoleController {
  public static async update(req: FastifyRequest, reply: FastifyReply) {
    const orgSchema = Joi.object({
      organizationId: Joi.number().required(),
      role: Joi.string().valid('ADMIN', 'AGENT', 'VIEWER').required(),
    });

    const { id } = req.params as { id: string };
    const userId = parseInt(id, 10);

    const { error, value } = orgSchema.validate(req.body);

    if (error) {
      return reply.status(400).send({
        success: false,
        error: `Validation error: ${error.details[0].message}`,
      });
    }

    const data: UpdateRoleRequestDTO = value;

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          success: false,
          error: 'Authorization token is missing or invalid.',
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = await JwtUtils.verifyToken(token, envConfig.JWT_SECRET);

      if (!decoded || typeof decoded.userId !== 'number') {
        return reply.status(401).send({
          success: false,
          error: 'Invalid or expired authentication token.',
        });
      }

      const agentMembership =
        await OrganizationUserRepository.findByOrganizationIdAndUserId(
          userId,
          data.organizationId,
        );

      if (!agentMembership) {
        return reply.status(404).send({
          success: false,
          error: 'Target user not found in the specified organization.',
        });
      }

      const adminMembership =
        await OrganizationUserRepository.findByOrganizationIdAndUserId(
          data.organizationId,
          decoded.userId,
        );

      if (!adminMembership) {
        return reply.status(403).send({
          success: false,
          error: 'You are not a member of this organization.',
        });
      }

      if (adminMembership.role !== Role.ADMIN) {
        return reply.status(403).send({
          success: false,
          error: 'Only administrators can update user roles.',
        });
      }

      if (agentMembership.organizationId !== adminMembership.organizationId) {
        return reply.status(400).send({
          success: false,
          error: 'The target user does not belong to your organization.',
        });
      }

      if (agentMembership.role === data.role) {
        return reply.status(400).send({
          success: false,
          error: `The user already has the role '${data.role}'.`,
        });
      }

      await OrganizationUserRepository.updateRole(
        userId,
        data.organizationId,
        data.role,
      );

      setAuditData(req, userId, 'UPDATE_ROLE_ORGANIZATION', true, {
        authorEmail: decoded.email,
        authorId: decoded.userId,
        role: data.role,
        organization: data.organizationId,
      });

      return reply.status(200).send({
        success: true,
        message: `User role successfully updated to '${data.role}'.`,
      });
    } catch (err) {
      console.error('[UpdateRoleController] Unexpected error:', err);
      return reply.status(500).send({
        success: false,
        error: 'An unexpected error occurred while updating the user role.',
      });
    }
  }
}
