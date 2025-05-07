import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';
import Joi from 'joi';
import { registerUserRequestDTO } from './registerUserDTO';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { UserAddressRepository } from '../../../repository/userAddressRepository';

export class registerUserController {
  static async createUser(req: FastifyRequest, reply: FastifyReply) {
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(3).required(),
      cpf: Joi.string()
        .pattern(/^\d{11}$/)
        .required(),
      phone: Joi.string().optional(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
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

      const newUserAddress = await UserAddressRepository.createUserAddress({
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      });
      const newUser = await UserRepository.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        cpf: data.cpf,
        address: {
          connect: { id: newUserAddress.id },
        },
      });

      setAuditData(req, null, 'REGISTER', true, {
        email: data.email,
      });

      await auditLogMiddleware(req, reply);

      reply.status(201).send(newUser);
    } catch (err) {
      console.log(err);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
