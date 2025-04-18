import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { LogoutUserController } from './logoutUserController';
import { BlacklistRepository } from '../../../repository/blackListRepository';

jest.mock('../../../repository/blackListRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/auth/logout', LogoutUserController.create);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /auth/logout - Logout User', () => {
  it('should return 401 if the token is not provided', async () => {
    const response = await request(fastify.server).post('/auth/logout').send();
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token not provided');
  });

  it('should return 401 if the token format is invalid', async () => {
    const response = await request(fastify.server)
      .post('/auth/logout')
      .set('Authorization', 'InvalidToken')
      .send();
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid token format');
  });

  it('should return 200 if the token is blacklisted successfully', async () => {
    const token = 'validToken123';
    (BlacklistRepository.addToken as jest.Mock).mockResolvedValue(true);
    const response = await request(fastify.server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Token blacklisted successfully');
  });

  it('should return 500 if there is an unexpected error', async () => {
    const token = 'validToken123';
    (BlacklistRepository.addToken as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );
    const response = await request(fastify.server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
