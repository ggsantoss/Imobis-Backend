import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class ImageRepository {
  public static async create(data: Prisma.ImageCreateInput) {
    const image = await prisma.image.create({
      data,
    });
    return image;
  }
}
