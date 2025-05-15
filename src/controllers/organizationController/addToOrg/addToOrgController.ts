import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationInviteRepository } from '../../../repository/organizationInviteRepository';
import { OrganizationUserRepository } from '../../../repository/organizationUserRepository';
import { JwtUtils } from '../../../utils/jwt';
import { envConfig } from '../../../config/envConfig';

export class AddToOrgController {
  public static async add(req: FastifyRequest, reply: FastifyReply) {
    const { token } = req.query as { token: string };
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const tokenUser = authHeader.split(' ')[1];

    try {
      const decoded = await JwtUtils.verifyToken(
        tokenUser,
        envConfig.JWT_SECRET,
      );
      const decodedAuthUser = await JwtUtils.verifyToken(
        token,
        envConfig.INVITE_SECRET,
      );

      if (!decodedAuthUser) {
        return reply
          .status(401)
          .send({ error: 'Unauthorized - Invalid invitation token' });
      }

      if (!decoded) {
        return reply.status(404).send({ error: 'User not found' });
      }

      if (typeof decoded.userId !== 'number') {
        throw new Error('Invalid user');
      }

      const invite = await OrganizationInviteRepository.findByToken(token);
      if (!invite) {
        return reply.status(404).send({ error: 'Token not found' });
      }

      if (invite.used || invite.expiresAt < new Date()) {
        return reply.status(400).send({ message: 'Invite has expired' });
      }

      const alreadyInOrg = await OrganizationUserRepository.alreadyInOrg(
        decoded.userId,
        invite.organizationId,
      );
      if (alreadyInOrg) {
        return reply
          .status(400)
          .send({ error: 'User already in this organization' });
      }

      if (decoded.email !== decodedAuthUser.email) {
        return reply.status(401).send({
          error:
            'No permission for this user to participate in this organization, email mismatch',
        });
      }

      await OrganizationInviteRepository.updateUsed(invite.id, true);

      await OrganizationUserRepository.create({
        user: { connect: { id: decoded.userId } },
        organization: { connect: { id: invite.organizationId } },
        role: 'AGENT',
      });

      return reply.status(200).send({
        success: true,
        message: 'User successfully added to the organization',
      });
    } catch (error) {
      console.error('Error during invitation process:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
