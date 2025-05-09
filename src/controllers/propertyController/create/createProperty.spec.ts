import Fastify, { FastifyInstance } from 'fastify';
import { CreatePropertyController } from './createProperyController';
import { UserRepository } from '../../../repository/userRepository';
import { AddressRepository } from '../../../repository/adressRepository';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { PropertyStatus } from '@prisma/client';

jest.mock('../../../repository/userRepository');
jest.mock('../../../repository/adressRepository');
jest.mock('../../../repository/propertyRepository');

// Mock do JWT
jest.mock('../../../utils/jwt', () => ({
  JwtUtils: {
    verifyToken: jest.fn(() => ({ userId: 1 })),
  },
}));

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/properties', CreatePropertyController.create);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /properties - Create Property', () => {
  const validPayload = {
    title: 'House for sale',
    description: 'Beautiful house in the city center',
    price: 300000,
    street: 'Main St',
    city: 'Metropolis',
    state: 'SP',
    zipCode: '12345-000',
    country: 'Brazil',
    area: 120,
    status: PropertyStatus.AVAILABLE,
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  };

  const defaultHeaders = {
    authorization: 'Bearer dummy-token',
  };

  it('should return 400 for invalid payload', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: { ...validPayload, title: '' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 if user does not exist', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: validPayload,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('User not found');
  });

  it('should return 201 and created property', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (AddressRepository.create as jest.Mock).mockResolvedValue({ id: 123 });
    (PropertyRepository.create as jest.Mock).mockResolvedValue({
      id: 999,
      ...validPayload,
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().id).toBe(999);
  });

  it('should return 500 if repository throws error', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (AddressRepository.create as jest.Mock).mockImplementation(() => {
      throw new Error('DB Error');
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: validPayload,
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
  });
});
