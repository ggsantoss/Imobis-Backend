import { AdVisibility, Prisma, TipoAnuncio } from '@prisma/client';
import { prisma } from '../db/prisma';

export class AnuncioRepository {
  public static async create(data: Prisma.AnuncioCreateInput) {
    const newAnuncio = await prisma.anuncio.create({
      data,
    });
    return newAnuncio;
  }

  public static async getAllAnuncios(filters: {
    page?: number;
    limit?: number;
    tipoAnuncio?: TipoAnuncio;
    tipoImovel?: string;
    finalidade?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    userId?: number;
    imovelId?: number;
  }) {
    const {
      page = 1,
      limit = 10,
      tipoAnuncio,
      tipoImovel,
      finalidade,
      city,
      minPrice,
      maxPrice,
      userId,
      imovelId,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.AnuncioWhereInput = {
      tipoAnuncio,
      ...(tipoImovel ? { tipoImovel } : {}),
      ...(minPrice || maxPrice
        ? { price: { gte: minPrice, lte: maxPrice } }
        : {}),
      ...(userId ? { userId } : {}),
      ...(imovelId ? { imovelId } : {}),
      imovel: {
        ...(city ? { address: { is: { city } } } : {}),
      },
    };

    const anuncios = await prisma.anuncio.findMany({
      where,
      take: limit,
      skip,
      include: {
        imovel: {
          include: {
            address: true,
            user: true,
          },
        },
      },
    });

    const total = await prisma.anuncio.count({ where });

    return {
      anuncios,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async findById(id: number) {
    const anuncio = await prisma.anuncio.findUnique({
      where: {
        id,
      },
      include: {
        imovel: {
          include: {
            user: true,
          },
        },
      },
    });
    return anuncio;
  }

  public static async update(id: number, data: Prisma.AnuncioUpdateInput) {
    const updatedAnuncio = await prisma.anuncio.update({
      where: {
        id,
      },
      data,
    });
    return updatedAnuncio;
  }

  public static async delete(id: number) {
    const deletedAnuncio = await prisma.anuncio.delete({
      where: {
        id,
      },
    });
    return deletedAnuncio;
  }

  public static async changeVisibility(id: number, visibility: AdVisibility) {
    return prisma.anuncio.update({
      where: { id },
      data: { visibility },
    });
  }

  public static async getAdsByUserId(userId: number) {
    return prisma.anuncio.findMany({
      where: {
        userId: userId,
      },
    });
  }
}
