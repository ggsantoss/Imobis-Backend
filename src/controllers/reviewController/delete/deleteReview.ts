import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { ReviewRepository } from '../../../repository/reviewRepository';

export class DeleteReviewController {
  public static async delete(req: FastifyRequest, reply: FastifyReply) {
    const schema = Joi.object({
      id: Joi.number().integer().required().messages({
        'number.base': '"id" must be a number',
        'number.integer': '"id" must be an integer',
        'any.required': '"id" is required',
      }),
    });

    try {
      const { error } = schema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const { id } = req.body as { id: number };

      const deletedUser = await ReviewRepository.delete(id);
      if (deletedUser) {
        reply
          .status(204)
          .send({ success: true, message: 'Delete successfully' });
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (err) {
      console.log('[ERROR] DeleteReviewController: ' + err);
    }
  }
}
