import Fastify, { FastifyInstance } from 'fastify';
import request from 'supertest';
import { AddViewController } from './addViewController';
import { AdRepository } from '../../../repository/advertisementRepository';

jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/ad/view/:id', AddViewController.add);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /ad/view/:id - Add Advertisement View', () => {
  it('should return 400 if id param is invalid', async () => {
    const response = await request(fastify.server).post('/ad/view/abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('id must be a number');
  });

  it('should return 200 with the view count', async () => {
    (AdRepository.addView as jest.Mock).mockResolvedValue({ views: 10 });

    const response = await request(fastify.server).post('/ad/view/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ views: 10 });
  });

  it('should return 500 on unexpected error', async () => {
    (AdRepository.addView as jest.Mock).mockImplementation(() => {
      throw new Error('DB error');
    });

    const response = await request(fastify.server).post('/ad/view/1');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
    expect(response.body.details).toBe('DB error');
  });
});
