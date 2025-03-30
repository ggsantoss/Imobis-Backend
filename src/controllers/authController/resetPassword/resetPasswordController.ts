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

    try {
      const decoded = JwtUtils.verifyRecoveryToken(token) as { email: string };

      if (!decoded.email) {
        return reply.status(400).send({ error: 'Invalid token' });
      }

      const user = await UserRepository.findByEmail(decoded.email);

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const findBlacklist = await BlacklistRepository.isTokenBlacklisted(token);

      if (findBlacklist) {
        return reply.status(404).send({ error: 'Token expired or invalid!' });
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
