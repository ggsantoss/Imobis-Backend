import { Organization, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export class OrganizationRepository {
  public static async create(
    data: Prisma.OrganizationCreateInput,
  ): Promise<Organization> {
    const org = await prisma.organization.create({
      data,
    });

    return org;
  }

  public static async delete(id: number): Promise<void> {
    await prisma.organization.delete({
      where: { id: id },
    });
  }

  public static async findById(id: number): Promise<Organization | null> {
    const org = await prisma.organization.findFirst({
      where: { id: id },
    });

    return org;
  }

  public static async findAll(
    skip: number,
    limit: number,
  ): Promise<Organization[]> {
    const orgs = await prisma.organization.findMany({
      take: limit,
      skip,
    });

    return orgs;
  }
}
