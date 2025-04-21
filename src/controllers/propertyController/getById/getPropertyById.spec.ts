import Fastify, { FastifyInstance } from 'fastify';
import { GetPropertyByIdController } from './getPropertyByIdController';
import { PropertyRepository } from '../../../repository/propertyRepository';
import * as cacheUtils from '../../../utils/cache';

jest.mock('../../../repository/propertyRepository');
jest.mock('../../../utils/cache');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/properties/:id', GetPropertyByIdController.getPropertyById);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /properties/:id - Get Property By ID', () => {
  it('should return 400 if ID is invalid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'Invalid property ID' });
  });

  it('should return cached property if available', async () => {
    const mockProperty = { id: 1, title: 'Test Property' };
    (cacheUtils.getCache as jest.Mock).mockResolvedValue(mockProperty);

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockProperty);
    expect(PropertyRepository.findById).not.toHaveBeenCalled();
  });

  it('should fetch property and cache it if not in cache', async () => {
    const mockProperty = { id: 2, title: 'Another Property' };
    (cacheUtils.getCache as jest.Mock).mockResolvedValue(null);
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(mockProperty);

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/2',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockProperty);
    expect(cacheUtils.setCache).toHaveBeenCalledWith(
      'property:2',
      mockProperty,
      300,
    );
  });

  it('should return 404 if property is not found', async () => {
    (cacheUtils.getCache as jest.Mock).mockResolvedValue(null);
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Property not found' });
  });

  it('should return 500 on unexpected error', async () => {
    (cacheUtils.getCache as jest.Mock).mockRejectedValue(
      new Error('Redis error'),
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties/1',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
  });
});
