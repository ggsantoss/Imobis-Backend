import { AdVisibility, Prisma, AdType } from '@prisma/client';
import { prisma } from '../db/prisma';
import { addMonths } from 'date-fns';

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

  public static async updatePaidVisibility(
    id: number,
    paidVisibility: boolean,
    expiresAt: Date | null,
  ) {
    try {
      const data: Prisma.AdUpdateInput = {
        paid_visible: paidVisibility,
        paid_visibility_expires_at: expiresAt,
      };

      const updatedAd = await prisma.ad.update({
        where: { id },
        data,
      });

      return updatedAd;
    } catch (error) {
      console.error(
        `Erro ao atualizar paid_visibility do anúncio ${id}:`,
        error,
      );
      throw error;
    }
  }

  public static async updateMonthsPaid(id: number, monthsPaid: number) {
    try {
      const ad = await prisma.ad.findUnique({ where: { id } });

      if (!ad) {
        throw new Error(`Ad with id ${id} not found`);
      }

      const currentDate =
        ad.paid_visibility_expires_at &&
        ad.paid_visibility_expires_at > new Date()
          ? ad.paid_visibility_expires_at
          : new Date();

      const newExpirationDate = addMonths(currentDate, monthsPaid);

      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          months_paid: ad.months_paid + monthsPaid,
          paid_visible: true,
          paid_visibility_expires_at: newExpirationDate,
        },
      });

      return updatedAd;
    } catch (error) {
      console.error(`Erro ao atualizar months_paid do anúncio ${id}:`, error);
      throw error;
    }
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

  public static async findAdPaid(limit: number, page: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.ad.findMany({
        take: limit,
        skip,
        where: { paid_visible: true },
      }),
      prisma.ad.count({
        where: { paid_visible: true },
      }),
    ]);

    return {
      items,
      total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  public static async addView(adId: number) {
    const data: Prisma.AdUpdateInput = {
      views: {
        increment: 1,
      },
    };
    const view = await prisma.ad.update({
      where: { id: adId },
      data,
    });

    return view;
  }

  public static async findAdByPropertyId(propertyId: number) {
    const ad = prisma.ad.findFirst({
      where: { propertyId: propertyId },
    });

    return ad;
  }
}
