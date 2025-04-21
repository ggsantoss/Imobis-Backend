import Fastify, { FastifyInstance } from 'fastify';
import { GetAllPropertiesController } from './getAllPropertiesController';
import { PropertyRepository } from '../../../repository/propertyRepository';

jest.mock('../../../repository/propertyRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/properties', GetAllPropertiesController.getAllProperties);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /properties - Get All Properties', () => {
  it('should return paginated properties', async () => {
    const mockProperties = [{ id: 1 }, { id: 2 }];
    const mockTotal = 20;

    (PropertyRepository.getAllProperties as jest.Mock).mockResolvedValue(
      mockProperties,
    );
    (PropertyRepository.countProperties as jest.Mock).mockResolvedValue(
      mockTotal,
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties?page=1&limit=2',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: mockProperties,
      pagination: {
        total: mockTotal,
        page: 1,
        limit: 2,
        totalPages: 10,
      },
    });
  });

  it('should return default pagination if no query is provided', async () => {
    (PropertyRepository.getAllProperties as jest.Mock).mockResolvedValue([]);
    (PropertyRepository.countProperties as jest.Mock).mockResolvedValue(0);

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().pagination).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  });

  it('should return 500 on unexpected error', async () => {
    (PropertyRepository.getAllProperties as jest.Mock).mockRejectedValue(
      new Error('Unexpected'),
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/properties',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Error fetching properties');
  });
});
