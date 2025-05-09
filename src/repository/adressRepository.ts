import { prisma } from '../db/prisma';

export class AddressRepository {
  static async create(data: {
    street: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    zipCode?: string;
    country: string;
  }) {
    return prisma.address.create({
      data: {
        street: data.street,
        city: data.city,
        state: data.state,
        latitude: data.latitude,
        longitude: data.longitude,
        zipCode: data.zipCode,
        country: data.country,
      },
    });
  }
}
