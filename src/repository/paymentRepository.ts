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
    payment_id?: string,
  ) {
    const updatedPayment = await prisma.payment.update({
      where: { externalRef: externalReference },
      data: {
        status: status,
        paymentId: payment_id,
      },
    });
    return updatedPayment;
  }

  public static async findByPaymentId(payment_id: string) {
    return await prisma.payment.findUnique({
      where: { paymentId: payment_id },
    });
  }

  public static async findById(id: number) {
    return await prisma.payment.findUnique({
      where: { id: id },
    });
  }

  public static async findByExternalRef(external_ref: string) {
    const payemnt = await prisma.payment.findUnique({
      where: { externalRef: external_ref },
    });
    if (payemnt) {
      return payemnt;
    }
  }
}
