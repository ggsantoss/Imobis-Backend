import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';
import Joi from 'joi';
import { JwtUtils } from '../../../utils/jwt';
import { loginUserRequestDTO } from './loginUserDTO';

export class loginUserController {
  static async loginUser(req: FastifyRequest, reply: FastifyReply) {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    try {
      const { error, value } = loginSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: loginUserRequestDTO = value;

      const user = await UserRepository.findByEmail(data.email);

      if (!user) {
        return reply.status(400).send({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await BcryptUtils.comparePassword(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        return reply.status(400).send({ error: 'Invalid email or password' });
      }

      const token = JwtUtils.generateToken({
        userId: user.id,
        email: user.email,
        role: 'ADMIN',
      });

      reply.status(200).send({ token });
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
