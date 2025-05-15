import Joi from 'joi';
import { SendOrgInviteRequestDTO } from './sendOrgInviteDTO';
import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationUserRepository } from '../../../repository/organizationUserRepository';
import { JwtUtils } from '../../../utils/jwt';
import { addDays } from 'date-fns';
import { OrganizationInviteRepository } from '../../../repository/organizationInviteRepository';
import { UserRepository } from '../../../repository/userRepository';
import { envConfig } from '../../../config/envConfig';
import { EmailService } from '../../../service/sendEmailService';

export class SendOrgInviteController {
  public static async send(req: FastifyRequest, reply: FastifyReply) {
    const orgSchema = Joi.object<SendOrgInviteRequestDTO>({
      email: Joi.string().email().min(5).max(200).required(),
      organizationId: Joi.number().min(1).max(1000).required(),
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

      const token = authHeader.split(' ')[1];

      const decoded = await JwtUtils.verifyToken(token, envConfig.JWT_SECRET);
      if (!decoded || decoded === undefined) {
        return reply.status(404).send({ error: 'User Not found' });
      }

      if (typeof decoded.userId !== 'number') {
        throw new Error('Invalid user');
      }

      const orgUser = await OrganizationUserRepository.findById(decoded.userId);
      if (!orgUser || orgUser.role !== 'ADMIN') {
        return reply.status(403).send({
          message: 'Unauthorized, you must be an admin to create an invite',
        });
      }

      const userInvited = await UserRepository.findByEmail(data.email);
      if (!userInvited) {
        return reply
          .status(404)
          .send({ message: 'This user does not exist on our database' });
      }

      const newInviteToken = await EmailService.sendTokenInvite(data.email);

      const expiresAt = addDays(new Date(), 7);

      await OrganizationInviteRepository.create({
        email: data.email,
        token: newInviteToken,
        organization: { connect: { id: data.organizationId } },
        expiresAt,
      });

      return reply
        .status(200)
        .send({ message: 'Convite sent successfully', newInviteToken });
    } catch (err) {
      console.log('[SendOrgInviteController]', err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
