import Fastify, { FastifyInstance } from 'fastify';
import GetPaymentsInfo from './getPaymentInfoController';
import { PaymentRepository } from '../../../repository/paymentRepository';
import { getCache, setCache } from '../../../utils/cache';
import { auditLogMiddleware } from '../../../middleware/auditLog';

jest.mock('../../../repository/paymentRepository');
jest.mock('../../../utils/cache');
jest.mock('../../../middleware/auditLog');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/payments/:id', GetPaymentsInfo.getPaymentsInfo);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /payments/:id - Get Payment Info', () => {
  const payment = {
    id: 1,
    amount: 100,
    status: 'PAID',
    method: 'PIX',
  };

  it('should return 400 if ID is invalid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/payments/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid payment id');
  });

  it('should return 404 if payment is not found', async () => {
    (getCache as jest.Mock).mockResolvedValue(null);
    (PaymentRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'GET',
      url: '/payments/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Payment not found');
  });

  it('should return cached payment if exists', async () => {
    (getCache as jest.Mock).mockResolvedValue(payment);

    const response = await fastify.inject({
      method: 'GET',
      url: '/payments/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(payment);
  });

  it('should return 200 with payment data and call audit log', async () => {
    (getCache as jest.Mock).mockResolvedValue(null);
    (PaymentRepository.findById as jest.Mock).mockResolvedValue(payment);
    (setCache as jest.Mock).mockResolvedValue(undefined);
    (auditLogMiddleware as jest.Mock).mockResolvedValue(undefined);

    const response = await fastify.inject({
      method: 'GET',
      url: '/payments/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(payment);
    expect(setCache).toHaveBeenCalledWith('payment:1', payment, 60);
    expect(auditLogMiddleware).toHaveBeenCalled();
  });

  it('should return 500 on unexpected error', async () => {
    (getCache as jest.Mock).mockRejectedValue(new Error('Redis error'));

    const response = await fastify.inject({
      method: 'GET',
      url: '/payments/1',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Internal server error');
  });
});
