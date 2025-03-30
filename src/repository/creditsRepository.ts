import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class CreditsRepository {
  static async newCredits(userId: number, balance: number) {
    const newCredits = await prisma.credits.create({
      data: {
        userId,
        balance,
      },
    });
  }

  static async findByUserId(userId: number) {
    return prisma.credits.findUnique({
      where: { userId },
    });
  }

  public static async updateCredits(userId: number, amount: number) {
    try {
      const updatedCredits = await prisma.credits.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
      });

      return updatedCredits;
    } catch (err) {
      throw new Error('Erro ao atualizar os créditos');
    }
  }
}
