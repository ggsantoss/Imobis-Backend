import { Prisma, Review } from '@prisma/client';
import { prisma } from '../db/prisma';

export class ReviewRepository {
  public static async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    const review = await prisma.review.create({
      data,
    });

    return review;
  }

  public static async delete(id: number) {
    const deletedUser = await prisma.review.delete({
      where: { id: id },
    });

    return deletedUser;
  }

  public static async findById(id: number) {
    const user = await prisma.review.findFirst({
      where: { id: id },
    });

    return user;
  }

  public static async findAll(skip: number, limit: number): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      take: limit,
      skip,
    });

    return reviews;
  }

  public static async update(id: number, comment: string): Promise<Review> {
    const review = await prisma.review.update({
      where: { id: id },
      data: {
        comment: comment,
      },
    });

    return review;
  }
  public static async findByReviewerAndTarget(
    reviewerId: number,
    targetId: number,
  ) {
    return await prisma.review.findFirst({
      where: {
        reviewerId,
        userTargetId: targetId,
      },
    });
  }
}
