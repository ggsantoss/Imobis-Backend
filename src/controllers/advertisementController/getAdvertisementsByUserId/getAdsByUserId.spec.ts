import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { GetAdsByUserId } from './getAdsByUserId';
import { AdRepository } from '../../../repository/advertisementRepository';
import * as cache from '../../../utils/cache';

jest.mock('../../../repository/advertisementRepository');
jest.mock('../../../utils/cache');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/ads/user/:id', GetAdsByUserId.getAdsByUserId);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('GET /ads/user/:id - Get Ads by User ID', () => {
  const fakeAds = [
    {
      id: 1,
      userId: 2,
      title: 'Apartamento legal',
      description: 'Descrição do anúncio',
      price: 1200.0,
    },
  ];

  it('should return 400 if user ID is invalid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/user/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid user ID');
  });

  it('should return 404 if user has no ads', async () => {
    (AdRepository.getAdsByUserId as jest.Mock).mockResolvedValue([]);

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/user/99',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe(
      'The user does not have any advertisements',
    );
  });

  it('should return ads and set cache if not cached', async () => {
    (cache.getCache as jest.Mock).mockResolvedValue(null);

    (AdRepository.getAdsByUserId as jest.Mock).mockResolvedValue(fakeAds);

    const setCacheMock = jest.fn().mockResolvedValue(undefined);
    (cache.setCache as jest.Mock) = setCacheMock;

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/user/2',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(fakeAds);
    expect(setCacheMock).toHaveBeenCalledWith('user:2:ads', fakeAds, 60);
  });

  it('should return ads and set cache if not cached', async () => {
    (cache.getCache as jest.Mock).mockResolvedValue(null);
    (AdRepository.getAdsByUserId as jest.Mock).mockResolvedValue(fakeAds);
    (cache.setCache as jest.Mock).mockResolvedValue(undefined);

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/user/2',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(fakeAds);
    expect(cache.setCache).toHaveBeenCalledWith('user:2:ads', fakeAds, 60);
  });

  it('should return 500 on unexpected error', async () => {
    (cache.getCache as jest.Mock).mockRejectedValue(new Error('Redis down'));

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/user/2',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
    expect(response.json().details).toBeDefined();
  });
});
