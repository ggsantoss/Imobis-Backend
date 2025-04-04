import { prisma } from '../db/prisma';

export class AddressRepository {
  static async create(data: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  }) {
    return prisma.address.create({
      data: {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      },
    });
  }
}
