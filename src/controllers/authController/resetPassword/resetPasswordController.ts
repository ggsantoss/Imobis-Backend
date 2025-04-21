import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtUtils } from '../../../utils/jwt';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';
import Joi from 'joi';
import { BlacklistRepository } from '../../../repository/blackListRepository';

export class ResetPasswordController {
  static async resetPassword(req: FastifyRequest, reply: FastifyReply) {
    const schema = Joi.object({
      token: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return reply.status(400).send({ error: error.details[0].message });
    }

    const { token, newPassword } = value;

    let decoded: { email?: string };
    decoded = await JwtUtils.verifyRecoveryToken(token); // as { email?: string }
    if (!decoded) {
      return reply.status(400).send({ error: 'Token expired or invalid!' });
    }

    try {
      const isBlacklisted = await BlacklistRepository.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return reply.status(404).send({ error: 'Token expired or invalid!' });
      }

      if (!decoded?.email) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const user = await UserRepository.findByEmail(decoded.email);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const hashedPassword = await BcryptUtils.hashPassword(newPassword);

      await UserRepository.updatePassword(user.id, hashedPassword);

      await BlacklistRepository.addToken(token);

      return reply
        .status(200)
        .send({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('[Unexpected Error]', err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
