import { Prisma, PaymentStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

export class PaymentRepository {
  public static async create(data: Prisma.PaymentCreateInput) {
    const newPayment = await prisma.payment.create({
      data,
    });
    return newPayment;
  }

  public static async updateStatus(
    externalReference: string,
    status: PaymentStatus,
  ) {
    const updatedPayment = await prisma.payment.update({
      where: { externalReference: externalReference },
      data: {
        status: status,
      },
    });
    return updatedPayment;
  }

  public static async findByPaymentId(payment_id: string) {
    return await prisma.payment.findUnique({
      where: { paymentId: payment_id },
    });
  }
}
