import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class UserRepository {
  public static async create(data: Prisma.UserCreateInput) {
    const newUser = await prisma.user.create({
      data,
    });
    return newUser;
  }

  public static async getAllUsers(limit: number, skip: number) {
    return prisma.user.findMany({
      take: limit,
      skip,
    });
  }

  public static async countUsers() {
    return prisma.user.count();
  }

  public static async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  public static async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  public static async update(id: number, data: Prisma.UserUpdateInput) {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return updatedUser;
  }

  public static async delete(id: number) {
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });
    return deletedUser;
  }

  static async updatePassword(userId: number, newPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }
}
