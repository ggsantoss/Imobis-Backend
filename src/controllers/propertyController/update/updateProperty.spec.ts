import Fastify, { FastifyInstance } from 'fastify';
import { UpdatePropertyController } from './updatePropertyController';
import { PropertyRepository } from '../../../repository/propertyRepository';
import Joi from 'joi';

jest.mock('../../../repository/propertyRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.put('/properties/:id', UpdatePropertyController.update);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PUT /properties/:id - Update Property', () => {
  it('should return 400 if validation fails', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/properties/1',
      payload: { title: 'AB' }, // Invalid title
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: '"title" length must be at least 3 characters long',
    });
  });

  it('should return 404 if property is not found', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'PUT',
      url: '/properties/999',
      payload: { title: 'Valid Title', description: 'Valid Description' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Property not found' });
  });

  it('should update the property successfully', async () => {
    const mockProperty = {
      id: 1,
      title: 'Old Title',
      description: 'Old Description',
    };
    const mockUpdatedProperty = { ...mockProperty, title: 'New Title' };

    (PropertyRepository.findById as jest.Mock).mockResolvedValue(mockProperty);
    (PropertyRepository.update as jest.Mock).mockResolvedValue(
      mockUpdatedProperty,
    );

    const response = await fastify.inject({
      method: 'PUT',
      url: '/properties/1',
      payload: { title: 'New Title', description: 'New Description' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockUpdatedProperty);
  });

  it('should return 500 on internal error', async () => {
    (PropertyRepository.findById as jest.Mock).mockRejectedValue(
      new Error('DB Error'),
    );

    const response = await fastify.inject({
      method: 'PUT',
      url: '/properties/1',
      payload: { title: 'New Title', description: 'New Description' },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toHaveProperty('error', 'Something went wrong');
  });
});
