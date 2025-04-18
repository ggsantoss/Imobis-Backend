import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { DeleteUserController } from './deleteUserController';
import { UserRepository } from '../../../repository/userRepository';

jest.mock('../../../repository/userRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.delete('/user/delete', DeleteUserController.deleteUser);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('DELETE /user/delete - Rigorosos e Restritos', () => {
  it('should return 400 if the id is not provided', async () => {
    const response = await request(fastify.server)
      .delete('/user/delete')
      .send({}); // Falta o campo id

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"id" is required');
  });

  it('should return 400 if the id is not a valid number', async () => {
    const response = await request(fastify.server)
      .delete('/user/delete')
      .send({ id: 'invalid-id' }); // id inválido

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"id" must be a number');
  });

  it('should return 400 if the id is not an integer', async () => {
    const response = await request(fastify.server)
      .delete('/user/delete')
      .send({ id: 1.5 }); // id não é inteiro

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"id" must be an integer');
  });

  it('should return 404 if the user does not exist', async () => {
    (UserRepository.delete as jest.Mock).mockResolvedValue(false);

    const response = await request(fastify.server)
      .delete('/user/delete')
      .send({ id: 1 });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 200 and a success message if the user is deleted successfully', async () => {
    (UserRepository.delete as jest.Mock).mockResolvedValue(true);

    const response = await request(fastify.server)
      .delete('/user/delete')
      .send({ id: 1 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });

  it('should return 500 in case of an unexpected error', async () => {
    (UserRepository.delete as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    ); // Simula um erro inesperado

    const response = await request(fastify.server)
      .delete('/user/delete')
      .send({ id: 1 });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
