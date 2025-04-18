import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { GetAllUsersController } from './getAllUsersController';
import { UserRepository } from '../../../repository/userRepository';

jest.mock('../../../repository/userRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/users', GetAllUsersController.getUsers);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('GET /users - Rigorosos e Restritos', () => {
  it('should return 200 and list of users with pagination', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@example.com' },
      { id: 2, email: 'user2@example.com' },
    ];
    const totalUsers = 2;
    (UserRepository.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (UserRepository.countUsers as jest.Mock).mockResolvedValue(totalUsers);

    const response = await request(fastify.server).get(
      '/users?page=1&limit=10',
    );
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockUsers);
    expect(response.body.pagination.total).toBe(totalUsers);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.perPage).toBe(10);
    expect(response.body.pagination.totalPages).toBe(1);
  });

  it('should return 200 with empty list if no users are found', async () => {
    const mockUsers: any[] = [];
    const totalUsers = 0;
    (UserRepository.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (UserRepository.countUsers as jest.Mock).mockResolvedValue(totalUsers);

    const response = await request(fastify.server).get(
      '/users?page=1&limit=10',
    );
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockUsers);
    expect(response.body.pagination.total).toBe(totalUsers);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.perPage).toBe(10);
    expect(response.body.pagination.totalPages).toBe(0);
  });

  it('should return 400 if invalid page or limit is provided', async () => {
    const response = await request(fastify.server).get(
      '/users?page=invalid&limit=10',
    );
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid query parameters');
  });

  it('should return 500 if there is an unexpected error', async () => {
    (UserRepository.getAllUsers as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );
    const response = await request(fastify.server).get(
      '/users?page=1&limit=10',
    );
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
