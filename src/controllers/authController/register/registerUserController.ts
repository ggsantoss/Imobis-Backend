import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';
import Joi from 'joi';
import { registerUserRequestDTO } from './registerUserDTO';

export class registerUserController {
  static async createUser(req: FastifyRequest, reply: FastifyReply) {
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(3).required(),
      phone: Joi.string().optional(),
      address: Joi.string().optional(),
    });

    try {
      const { error, value } = userSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: registerUserRequestDTO = value;

      const userExists = await UserRepository.findByEmail(data.email);

      if (userExists) {
        return reply.status(400).send({ error: 'Email is already in use' });
      }

      const hashedPassword = await BcryptUtils.hashPassword(data.password);

      const newUser = await UserRepository.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        address: data.address,
      });

      reply.status(201).send(newUser);
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
