import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { GetAdByPaid } from './getAdByPaid';
import { AdRepository } from '../../../repository/advertisementRepository';

jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/ads/paid', GetAdByPaid.get);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /ads/paid - Get Paid Advertisements', () => {
  const mockAds = {
    items: [
      {
        id: 1,
        title: 'Ad 1',
        description: 'Desc 1',
      },
    ],
    page: 1,
    total: 1,
    totalPage: 1,
  };

  it('should return 400 for invalid query params', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/paid?page=abc&limit=-10',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      success: false,
      error: 'Invalid page or limit.',
    });
  });

  it('should return paid ads with pagination', async () => {
    (AdRepository.findAdPaid as jest.Mock).mockResolvedValue(mockAds);

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/paid?page=1&limit=10',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: mockAds.items,
      pagination: {
        page: mockAds.page,
        limit: 10,
        total: mockAds.total,
        totalPages: mockAds.totalPage,
      },
    });

    expect(AdRepository.findAdPaid).toHaveBeenCalledWith(10, 1);
  });

  it('should fallback to default values if query params are missing', async () => {
    (AdRepository.findAdPaid as jest.Mock).mockResolvedValue(mockAds);

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/paid',
    });

    expect(response.statusCode).toBe(200);
    expect(AdRepository.findAdPaid).toHaveBeenCalledWith(10, 1);
  });

  it('should return 500 on unexpected error', async () => {
    (AdRepository.findAdPaid as jest.Mock).mockRejectedValue(
      new Error('Database down'),
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads/paid?page=1&limit=10',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      success: false,
      error: 'Internal Server Error',
    });
  });
});
