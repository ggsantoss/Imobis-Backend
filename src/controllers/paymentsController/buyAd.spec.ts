import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { BuyAdController } from './buyAdController';
import { AdRepository } from '../../repository/advertisementRepository';
import { UserRepository } from '../../repository/userRepository';
import { UserAddressRepository } from '../../repository/userAddressRepository';
import { PaymentRepository } from '../../repository/paymentRepository';
import { preference } from '../../service/mercadopagoService';
import jwt from 'jsonwebtoken';

jest.mock('../../repository/advertisementRepository');
jest.mock('../../repository/userRepository');
jest.mock('../../repository/userAddressRepository');
jest.mock('../../repository/paymentRepository');
jest.mock('../../service/mercadopagoService');
jest.mock('jsonwebtoken');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/ad/buy', BuyAdController.buy);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

const validPayload = {
  quantity: 2,
  adId: 1,
};

const validToken = 'valid-token';

const mockAd = {
  id: 1,
  userId: 1,
  propertyId: 1,
};

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '123456789',
  cpf: '12345678900',
  addressId: 1,
};

const mockAddress = {
  street: '123 Main St',
  zipCode: '12345',
};

describe('POST /ad/buy - Buy Advertisement', () => {
  it('should return 400 if request body is invalid', async () => {
    const response = await request(fastify.server).post('/ad/buy').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"quantity" is required');
  });

  it('should return 401 if token is not provided', async () => {
    const response = await request(fastify.server)
      .post('/ad/buy')
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token not provided');
  });

  it('should return 404 if ad does not exist', async () => {
    AdRepository.findById = jest.fn().mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ad not found');
  });

  it('should return 403 if user is not the owner of the ad', async () => {
    AdRepository.findById = jest.fn().mockResolvedValue(mockAd);
    jwt.verify = jest.fn().mockReturnValue({ userId: 2 });

    const response = await request(fastify.server)
      .post('/ad/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      'You cannot pay for an ad that is not yours',
    );
  });

  it('should return 404 if user does not exist', async () => {
    AdRepository.findById = jest.fn().mockResolvedValue(mockAd);
    jwt.verify = jest.fn().mockReturnValue({ userId: mockAd.userId });
    UserRepository.findById = jest.fn().mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 404 if address does not exist', async () => {
    AdRepository.findById = jest.fn().mockResolvedValue(mockAd);
    jwt.verify = jest.fn().mockReturnValue({ userId: mockAd.userId });
    UserRepository.findById = jest.fn().mockResolvedValue(mockUser);
    UserAddressRepository.getUserAddress = jest.fn().mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User address not found');
  });

  it('should return 201 and the initPoint for payment if successful', async () => {
    AdRepository.findById = jest.fn().mockResolvedValue(mockAd);
    jwt.verify = jest.fn().mockReturnValue({ userId: mockAd.userId });
    UserRepository.findById = jest.fn().mockResolvedValue(mockUser);
    UserAddressRepository.getUserAddress = jest
      .fn()
      .mockResolvedValue(mockAddress);
    preference.create = jest
      .fn()
      .mockResolvedValue({ init_point: 'payment-url' });
    PaymentRepository.create = jest.fn().mockResolvedValue({});

    const response = await request(fastify.server)
      .post('/ad/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.initPoint).toBe('payment-url');
  });

  it('should return 500 on unexpected error', async () => {
    AdRepository.findById = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    const response = await request(fastify.server)
      .post('/ad/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
