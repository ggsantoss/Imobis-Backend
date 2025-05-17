import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { UpdateReviewRequestDTO } from './updateReviewDTO';
import { ReviewRepository } from '../../../repository/reviewRepository';

export class UpdateReviewCommentController {
  public static async updateComment(req: FastifyRequest, reply: FastifyReply) {
    const updateShema = Joi.object({
      comment: Joi.string().min(1).max(700).required(),
      commetId: Joi.number().id().required(),
    });

    const { error, value } = updateShema.validate(req.body);

    if (error) {
      return reply.status(400).send({ error: error.details[0].message });
    }

    const data: UpdateReviewRequestDTO = value;

    try {
      const updatedCommentReview = ReviewRepository.update(
        data.commentId,
        data.comment,
      );

      return reply.status(200).send({
        success: true,
        message: 'Review updated successfully',
        data: updatedCommentReview,
      });
    } catch (err) {
      console.log('[ERROR] UpdateReviewCommentController: ' + err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
