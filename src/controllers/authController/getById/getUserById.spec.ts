import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { GetUserByIdController } from './getuserByIdController';
import { UserRepository } from '../../../repository/userRepository';
import { getCache, setCache } from '../../../utils/cache';

jest.mock('../../../repository/userRepository');
jest.mock('../../../utils/cache');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/users/:id', GetUserByIdController.getUserById);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('GET /users/:id - Get user by ID', () => {
  it('should return 400 if the user ID is invalid', async () => {
    const response = await request(fastify.server).get('/users/invalid').send();
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid user ID');
  });

  it('should return 404 if the user is not found', async () => {
    (UserRepository.findById as jest.Mock).mockResolvedValue(null);
    const response = await request(fastify.server).get('/users/1').send();
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 200 and the user data if the user exists', async () => {
    const user = { id: 1, email: 'user@example.com' };
    (UserRepository.findById as jest.Mock).mockResolvedValue(user);
    (getCache as jest.Mock).mockResolvedValue(null); // Simulating no cache
    const response = await request(fastify.server).get('/users/1').send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });

  it('should return cached user data if available', async () => {
    const cachedUser = { id: 1, email: 'user@example.com' };
    (getCache as jest.Mock).mockResolvedValue(cachedUser); // Simulating cache hit
    const response = await request(fastify.server).get('/users/1').send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedUser);
  });

  it('should return 500 if there is an unexpected error', async () => {
    (UserRepository.findById as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );
    const response = await request(fastify.server).get('/users/1').send();
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
