import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { CreatePropertyController } from './createProperyController';
import { UserRepository } from '../../../repository/userRepository';
import { AddressRepository } from '../../../repository/adressRepository';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { PropertyStatus } from '@prisma/client';
import { GetCordinatesFromAddress } from '../../../service/getCordinatesFromAddress';

jest.mock('../../../repository/userRepository');
jest.mock('../../../repository/adressRepository');
jest.mock('../../../repository/propertyRepository');
jest.mock('../../../service/getCordinatesFromAddress');
jest.mock('../../../middleware/auditLog', () => ({
  auditLogMiddleware: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../helpers/auditHelper', () => ({
  setAuditData: jest.fn(),
}));
jest.mock('../../../utils/jwt', () => ({
  JwtUtils: {
    verifyToken: jest.fn(() => ({ userId: 1 })),
  },
}));

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.register(multipart); // necessário para multipart
  fastify.post('/properties', async (req, res) => {
    return CreatePropertyController.create(req, res);
  });
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

  it('should return 400 for invalid payload (empty title)', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: { ...validPayload, title: '' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toMatch(/"title" is not allowed to be empty/);
  });

  it('should return 400 if user is not found', async () => {
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

  it('should return 404 if coordinates not found', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (
      GetCordinatesFromAddress.getCoordinatesFromAddress as jest.Mock
    ).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: validPayload,
    });

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe('Address not found, cordenate invalid');
  });

  it('should return 500 if address creation fails', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (
      GetCordinatesFromAddress.getCoordinatesFromAddress as jest.Mock
    ).mockResolvedValue({
      lat: -23.55,
      lon: -46.63,
    });
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

  it('should return 201 and created property (without files)', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (
      GetCordinatesFromAddress.getCoordinatesFromAddress as jest.Mock
    ).mockResolvedValue({
      lat: -23.55,
      lon: -46.63,
    });
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

  it('should return 401 if authorization header is missing', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      payload: validPayload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe('Unauthorized');
  });

  it('should return 401 if token is invalid', async () => {
    const jwt = require('../../../utils/jwt');
    jwt.JwtUtils.verifyToken.mockReturnValue(null);

    const response = await fastify.inject({
      method: 'POST',
      url: '/properties',
      headers: defaultHeaders,
      payload: validPayload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe('Invalid token');
  });
});
