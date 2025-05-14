import { OrganizationUser, Prisma, Role } from '@prisma/client';
import { prisma } from '../db/prisma';

export class OrganizationUserRepository {
  public static async create(
    data: Prisma.OrganizationUserCreateInput,
  ): Promise<OrganizationUser> {
    const newOrganizationUser = prisma.organizationUser.create({
      data,
    });
    return newOrganizationUser;
  }

  public static async delete(id: number) {
    await prisma.organizationUser.delete({
      where: { id: id },
    });
  }

  public static async findById(id: number): Promise<OrganizationUser | null> {
    const organizationUser = await prisma.organizationUser.findFirst({
      where: { id: id },
    });

    return organizationUser;
  }

  public static async findAll(
    skip: number,
    limit: number,
  ): Promise<OrganizationUser[]> {
    const organizationUsers = await prisma.organizationUser.findMany({
      take: limit,
      skip,
    });

    return organizationUsers;
  }

  public static async alreadyInOrg(userId: number, organizationId: number) {
    const alreadyInOrg = prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: userId,
          organizationId: organizationId,
        },
      },
    });
    return alreadyInOrg;
  }

  public static async updateRole(
    userId: number,
    organizationId: number,
    role: Role,
  ) {
    const orgUserRole = prisma.organizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        role,
      },
    });
    return orgUserRole;
  }

  public static async findByOrganizationIdAndUserId(
    userId: number,
    organizationId: number,
  ) {
    const organizationUser = await prisma.organizationUser.findFirst({
      where: { organizationId: organizationId, userId: userId },
    });

    return organizationUser;
  }
}
