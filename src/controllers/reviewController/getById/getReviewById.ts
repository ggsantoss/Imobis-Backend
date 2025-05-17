import { FastifyReply, FastifyRequest } from 'fastify';
import { ReviewRepository } from '../../../repository/reviewRepository';
import Joi from 'joi';

export class GetReviewById {
  public static async getById(req: FastifyRequest, reply: FastifyReply) {
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

      const { id } = req.params as { id: string };
      const reviewId = parseInt(id, 10);

      if (isNaN(reviewId)) {
        return reply.status(400).send({ error: 'Invalid user ID' });
      }

      const review = await ReviewRepository.findById(reviewId);
      if (!review) {
        reply.status(404).send({ error: 'Review not found' });
      }
      return reply
        .status(200)
        .send({ success: true, message: 'User found', data: review });
    } catch (err) {
      console.log('[ERROR] GetReviewById: ' + err);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
