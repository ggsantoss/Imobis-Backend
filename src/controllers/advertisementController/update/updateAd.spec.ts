import Fastify, { FastifyInstance } from 'fastify';
import { UpdateAdController } from './updateAdController';
import { AdRepository } from '../../../repository/advertisementRepository';
import { AdVisibility } from '@prisma/client';

jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.put('/ads/:id', UpdateAdController.updateAd);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PUT /ads/:id - Update Advertisement', () => {
  const updatedAd = {
    id: 1,
    title: 'Updated Title',
    description: 'Updated description',
    adType: 'RENT',
    propertyId: 10,
    userId: 5,
    price: 1234,
    visibility: AdVisibility.VISIBLE,
  };

  it('should return 400 for invalid ad ID', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/ads/abc',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid ad ID');
  });

  it('should return 400 for invalid payload', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/ads/1',
      payload: {
        title: 'A',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toMatch(/at least/);
  });

  it('should return 404 if ad is not found', async () => {
    (AdRepository.update as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'PUT',
      url: '/ads/1',
      payload: {
        title: 'Valid Title',
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Ad not found');
  });

  it('should return 200 and the updated ad', async () => {
    (AdRepository.update as jest.Mock).mockResolvedValue(updatedAd);

    const response = await fastify.inject({
      method: 'PUT',
      url: '/ads/1',
      payload: {
        title: 'Updated Title',
        description: 'Updated description',
        adType: 'RENT',
        propertyId: 10,
        userId: 5,
        price: 1234,
        visibility: AdVisibility.VISIBLE,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(updatedAd);
  });

  it('should return 500 if an unexpected error occurs', async () => {
    (AdRepository.update as jest.Mock).mockRejectedValue(
      new Error('Unexpected'),
    );

    const response = await fastify.inject({
      method: 'PUT',
      url: '/ads/1',
      payload: {
        title: 'Updated Title',
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
  });
});
