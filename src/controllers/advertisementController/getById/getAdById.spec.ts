import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { GetAdByIdController } from './getAdByIdController';
import { AdRepository } from '../../../repository/advertisementRepository';
import * as cache from '../../../utils/cache';

jest.mock('../../../repository/advertisementRepository');
jest.mock('../../../utils/cache');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/ads/:id', GetAdByIdController.getAdById);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /ads/:id - Get Advertisement by ID', () => {
  const fakeAd = {
    id: 1,
    userId: 2,
    title: 'Apartamento legal',
    description: 'Descrição do anúncio',
    price: 1200.0,
  };

  it('should return 400 if advertisement ID is invalid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid advertisement ID');
  });

  it('should return 404 if advertisement is not found', async () => {
    (AdRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Advertisement not found');
  });

  it('should return advertisement and set cache if not cached', async () => {
    (cache.getCache as jest.Mock).mockResolvedValue(null);
    (AdRepository.findById as jest.Mock).mockResolvedValue(fakeAd);

    const setCacheMock = jest.fn().mockResolvedValue(undefined);
    (cache.setCache as jest.Mock) = setCacheMock;

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(fakeAd);
    expect(setCacheMock).toHaveBeenCalledWith('advertisement:1', fakeAd, 300);
  });

  it('should return advertisement from cache if cached', async () => {
    (cache.getCache as jest.Mock).mockResolvedValue(fakeAd);

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(fakeAd);
    expect(cache.setCache).not.toHaveBeenCalled();
  });

  it('should return 500 on unexpected error', async () => {
    (cache.getCache as jest.Mock).mockRejectedValue(new Error('Redis down'));

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/1',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
    expect(response.json().details).toBeDefined();
  });
});
