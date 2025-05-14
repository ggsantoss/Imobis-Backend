import { OrganizationInvite, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class OrganizationInviteRepository {
  public static async create(
    data: Prisma.OrganizationInviteCreateInput,
  ): Promise<OrganizationInvite> {
    const invite = prisma.organizationInvite.create({
      data,
    });

    return invite;
  }

  public static async findByToken(token: string) {
    const invite = prisma.organizationInvite.findFirst({
      where: { token: token },
    });

    return invite;
  }

  public static async updateUsed(id: number, newStatement: boolean) {
    const invite = prisma.organizationInvite.update({
      where: { id: id },
      data: { used: newStatement },
    });

    return invite;
  }
}
