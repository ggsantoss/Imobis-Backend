export interface CreatePaymentRequestDTO {
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'FAILED';
  anuncioId: number;
  userId: number;
  externalReference: string;
  email: string;
}
