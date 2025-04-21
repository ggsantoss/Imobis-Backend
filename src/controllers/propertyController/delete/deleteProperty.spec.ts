import Fastify, { FastifyInstance } from 'fastify';
import { DeletePropertyController } from './deletePropertyController';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('../../../repository/propertyRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.delete('/properties/:id', DeletePropertyController.deleteProperty);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DELETE /properties/:id - Delete Property', () => {
  it('should return 400 for invalid id', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/properties/invalid',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('id must be a number');
  });

  it('should return 404 if property is not found', async () => {
    (PropertyRepository.delete as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/properties/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Property not found');
  });

  it('should return 200 if property is deleted', async () => {
    (PropertyRepository.delete as jest.Mock).mockResolvedValue({ id: 999 });

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/properties/999',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe('Property deleted successfully');
  });

  it('should return 404 if Prisma throws P2025 error', async () => {
    (PropertyRepository.delete as jest.Mock).mockImplementation(() => {
      throw new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '4.0.0',
      });
    });

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/properties/999',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error).toBe('Property not found');
  });

  it('should return 500 if unexpected error occurs', async () => {
    (PropertyRepository.delete as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown error');
    });

    const response = await fastify.inject({
      method: 'DELETE',
      url: '/properties/999',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe('Something went wrong');
  });
});
