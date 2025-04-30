import { prisma } from '../db/prisma';

export class BlacklistRepository {
  static async addToken(token: string): Promise<void> {
    await prisma.blacklistToken.create({
      data: { token },
    });
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await prisma.blacklistToken.findUnique({
      where: { token },
    });
    return !!result;
  }

  static async removeExpiredTokens(): Promise<void> {
    await prisma.blacklistToken.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 3600 * 1000),
        },
      },
    });
  }
}
