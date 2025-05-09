import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class PropertyRepository {
  public static async create(data: Prisma.PropertyCreateInput) {
    const newProperty = await prisma.property.create({
      data,
    });
    return newProperty;
  }

  public static async getAllProperties(limit: number, skip: number) {
    return prisma.property.findMany({
      take: limit,
      skip,
      include: {
        address: true,
        user: true,
      },
    });
  }

  public static async countProperties() {
    return prisma.property.count();
  }

  public static async findById(id: number) {
    const property = await prisma.property.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
        user: true,
      },
    });
    return property;
  }

  public static async update(id: number, data: Prisma.PropertyUpdateInput) {
    const updatedProperty = await prisma.property.update({
      where: {
        id,
      },
      data,
    });
    return updatedProperty;
  }

  public static async delete(id: number) {
    await prisma.image.deleteMany({
      where: {
        propertyId: id,
      },
    });

    const deletedProperty = await prisma.property.delete({
      where: { id },
    });

    return deletedProperty;
  }

  public static async getPropertyByUserId(userId: number) {
    return prisma.property.findMany({
      where: {
        userId: userId,
      },
      include: {
        address: true,
        user: true,
      },
    });
  }
}
