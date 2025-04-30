import { AdVisibility, Prisma, AdType } from '@prisma/client';
import { prisma } from '../db/prisma';

export class AdRepository {
  public static async create(data: Prisma.AdCreateInput) {
    const newAd = await prisma.ad.create({
      data,
    });
    return newAd;
  }

  public static async getAllAds(filters: {
    page?: number;
    limit?: number;
    adType?: AdType;
    propertyType?: string;
    purpose?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    userId?: number;
    propertyId?: number;
  }) {
    const {
      page = 1,
      limit = 10,
      adType,
      propertyType,
      purpose,
      city,
      minPrice,
      maxPrice,
      userId,
      propertyId,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AdWhereInput = {
      adType,
      ...(propertyType ? { propertyType } : {}),
      ...(minPrice || maxPrice
        ? { price: { gte: minPrice, lte: maxPrice } }
        : {}),
      ...(userId ? { userId } : {}),
      ...(propertyId ? { propertyId } : {}),
      property: {
        ...(city ? { address: { is: { city } } } : {}),
      },
    };

    const ads = await prisma.ad.findMany({
      where,
      take: limit,
      skip,
      include: {
        property: {
          include: {
            address: true,
            user: true,
          },
        },
      },
    });

    const total = await prisma.ad.count({ where });

    return {
      ads,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async findById(id: number) {
    const ad = await prisma.ad.findUnique({
      where: {
        id,
      },
      include: {
        property: {
          include: {
            user: true,
          },
        },
      },
    });
    return ad;
  }

  public static async update(id: number, data: Prisma.AdUpdateInput) {
    const updatedAd = await prisma.ad.update({
      where: {
        id,
      },
      data,
    });
    return updatedAd;
  }

  public static async delete(id: number) {
    const deletedAd = await prisma.ad.delete({
      where: {
        id,
      },
    });
    return deletedAd;
  }

  public static async changeVisibility(id: number, visibility: AdVisibility) {
    return prisma.ad.update({
      where: { id },
      data: { visibility },
    });
  }

  public static async getAdsByUserId(userId: number) {
    return prisma.ad.findMany({
      where: {
        userId: userId,
      },
    });
  }
}
