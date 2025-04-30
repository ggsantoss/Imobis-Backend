import Fastify, { FastifyInstance } from 'fastify';
import request from 'supertest';
import { DeleteAdController } from './deleteAdController';
import { AdRepository } from '../../../repository/advertisementRepository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.delete('/ad/:id', DeleteAdController.deleteAd);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('DELETE /ad/:id - Delete Advertisement', () => {
  it('should return 400 if id param is missing or invalid', async () => {
    const response = await request(fastify.server).delete('/ad/abc'); // id inválido

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('id must be a number');
  });

  it('should return 404 if advertisement not found', async () => {
    (AdRepository.delete as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server).delete('/ad/999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Property not found');
  });

  it('should return 200 on successful deletion', async () => {
    (AdRepository.delete as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Teste',
    });

    const response = await request(fastify.server).delete('/ad/1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Advertisement deleted successfully');
  });

  it('should return 500 on unexpected error', async () => {
    (AdRepository.delete as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(fastify.server).delete('/ad/1');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
