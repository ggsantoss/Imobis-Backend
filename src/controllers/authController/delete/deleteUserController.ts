import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../../repository/userRepository';
import Joi from 'joi';

export class DeleteUserController {
  static async deleteUser(req: FastifyRequest, reply: FastifyReply) {
    const schema = Joi.object({
      id: Joi.number().integer().required().messages({
        'number.base': 'id must be a number',
        'number.integer': 'id must be an integer',
        'any.required': 'id is required',
      }),
    });

    try {
      const { error } = schema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const { id } = req.body as { id: number };

      const deletedUser = await UserRepository.delete(id);

      if (deletedUser) {
        reply.status(200).send({ message: 'User deleted successfully' });
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
