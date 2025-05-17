import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { ReviewRepository } from '../../../repository/reviewRepository';
import { JwtUtils } from '../../../utils/jwt';
import { envConfig } from '../../../config/envConfig';

export class CreateReviewController {
  public static async create(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const reviewSceham = Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().min(1).max(300).optional(),
      userTargetId: Joi.number().id().optional(),
      orgTargetId: Joi.number().id().optional(),
    });

    const { error, value } = reviewSceham.validate(req.body);
    if (error) {
      reply
        .status(422)
        .send({ error: `Validation error: ${error.details[0].message}` });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      reply
        .status(401)
        .send({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtils.verifyToken(token, envConfig.JWT_SECRET);

    if (!decoded || decoded.userId === undefined) {
      reply.status(401).send({ error: 'Invalid or expired token' });
      return;
    }

    const userId = decoded.userId;

    try {
      const existReview = await ReviewRepository.findByReviewerAndTarget(
        userId,
        value.userTargetId,
      );
      if (existReview) {
        return reply
          .status(401)
          .send({ error: "You've already reviewed this user/organization" });
      }

      const targetConnectionField =
        value.orgTargetId != null
          ? { orgTarget: { connect: { id: value.orgTargetId } } }
          : { userTarget: { connect: { id: value.userTargetId } } };

      const review = await ReviewRepository.create({
        ...targetConnectionField,
        comment: value.comment,
        rating: value.rating,
        reviewer: { connect: { id: userId } },
      });
      reply
        .status(201)
        .send({ success: true, message: 'Created successfully', data: review });
    } catch (err) {
      console.log('[ERROR] CreateReviewController: ' + err);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
