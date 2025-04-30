import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

export class UserAddressRepository {
    public static async createUserAddress(data: Prisma.UserAddressCreateInput) {
        const newUserAddress = await prisma.userAddress.create({
            data,
        });
        return newUserAddress;
    }
}