import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class PropertyRepository {
  public static async create(data: Prisma.ImovelCreateInput) {
    const newProperty = await prisma.imovel.create({
      data,
    });
    return newProperty;
  }

  public static async getAllProperties(limit: number, skip: number) {
    return prisma.imovel.findMany({
      take: limit,
      skip,
    });
  }

  public static async countProperties() {
    return prisma.imovel.count();
  }

  public static async findById(id: number) {
    const property = await prisma.imovel.findUnique({
      where: {
        id,
      },
    });
    return property;
  }

  public static async update(id: number, data: Prisma.ImovelUpdateInput) {
    const updatedProperty = await prisma.imovel.update({
      where: {
        id,
      },
      data,
    });
    return updatedProperty;
  }

  public static async delete(id: number) {
    await prisma.imagem.deleteMany({
      where: {
        imovelId: id,
      },
    });

    const deletedProperty = await prisma.imovel.delete({
      where: { id },
    });

    return deletedProperty;
  }

  public static async getPropertyByUserId(userId: number) {
    return prisma.imovel.findMany({
      where: {
        userId: userId,
      },
    });
  }
}
