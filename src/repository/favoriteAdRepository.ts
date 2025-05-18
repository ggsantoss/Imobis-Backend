import { FavoriteAd, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class favoriteAdRepository {
  public static async create(
    data: Prisma.FavoriteAdCreateInput,
  ): Promise<FavoriteAd> {
    const favoriteAd = await prisma.favoriteAd.create({
      data,
    });

    return favoriteAd;
  }

  public static async delete(id: number): Promise<void> {
    await prisma.favoriteAd.delete({
      where: { id: id },
    });
  }

  public static async getById(id: number): Promise<FavoriteAd | null> {
    const favoriteAd = await prisma.favoriteAd.findFirst({
      where: { id: id },
    });

    return favoriteAd;
  }

  public static async getAll(
    limit: number,
    skip: number,
  ): Promise<FavoriteAd[]> {
    const favoritesAd = await prisma.favoriteAd.findMany({
      take: limit,
      skip,
    });

    return favoritesAd;
  }

  public static async getAllFromUser(
    id: number,
    limit: number,
    skip: number,
  ): Promise<FavoriteAd[]> {
    const favoritesAd = await prisma.favoriteAd.findMany({
      where: { userId: id },
      take: limit,
      skip,
    });

    return favoritesAd;
  }

  public static async update(
    id: number,
    data: Prisma.FavoriteAdUpdateInput,
  ): Promise<FavoriteAd> {
    const favoriteAd = await prisma.favoriteAd.update({
      where: { id: id },
      data,
    });

    return favoriteAd;
  }
}
