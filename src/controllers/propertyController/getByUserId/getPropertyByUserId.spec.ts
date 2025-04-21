import Fastify, { FastifyInstance } from 'fastify';
import { GetPropertyByUserId } from './getPropertyByUserId';
import { PropertyRepository } from '../../../repository/propertyRepository';

jest.mock('../../../repository/propertyRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/properties/user/:id', GetPropertyByUserId.getPropertyByUserId);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /properties/user/:id - Get Property By User ID', () => {
  it('should return 400 if user ID is invalid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/user/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'Invalid user ID' });
  });

  it('should return 404 if user has no property', async () => {
    (PropertyRepository.getPropertyByUserId as jest.Mock).mockResolvedValue(
      null,
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/user/123',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'The user do not have any property',
    });
  });

  it('should return property list for valid user ID', async () => {
    const mockProperties = [
      { id: 1, title: 'Casa 1' },
      { id: 2, title: 'Casa 2' },
    ];
    (PropertyRepository.getPropertyByUserId as jest.Mock).mockResolvedValue(
      mockProperties,
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/user/5',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockProperties);
  });

  it('should return 500 on internal error', async () => {
    (PropertyRepository.getPropertyByUserId as jest.Mock).mockRejectedValue(
      new Error('DB Error'),
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/user/1',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toHaveProperty('error', 'Something went wrong');
  });
});
