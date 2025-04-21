import Fastify, { FastifyInstance } from 'fastify';
import { SoftDeleteController } from './softDeleteController';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import { AdVisibility } from '@prisma/client';

jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.delete('/ads/:id', SoftDeleteController.softDeleteAd);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DELETE /ads/:id - Soft Delete Advertisement', () => {
  const fakeAd = {
    id: 1,
    userId: 2,
    title: 'Anúncio de teste',
    description: 'Descrição de teste',
    price: 999,
    visibility: AdVisibility.VISIBLE,
  };

  const updatedAd = {
    ...fakeAd,
    visibility: AdVisibility.INVISIBLE,
  };

  it('should return 400 if ID is invalid', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/ads/abc',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid ID');
  });

  it('should return 404 if ad is not found', async () => {
    (AnuncioRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/ads/123',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Ad not found');
  });

  it('should return 200 and soft delete ad if found', async () => {
    (AnuncioRepository.findById as jest.Mock).mockResolvedValue(fakeAd);
    (AnuncioRepository.changeVisibility as jest.Mock).mockResolvedValue(
      updatedAd,
    );

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/ads/1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe('Ad successfully removed');
    expect(response.json().ad).toEqual(updatedAd);
  });

  it('should return 500 on unexpected error', async () => {
    (AnuncioRepository.findById as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/ads/1',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBeDefined();
  });
});
