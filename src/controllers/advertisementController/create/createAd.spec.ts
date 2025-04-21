import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { CreateAdController } from './createAdController';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { UserRepository } from '../../../repository/userRepository';
import { AnuncioRepository } from '../../../repository/advertisementRepository';

jest.mock('../../../repository/propertyRepository');
jest.mock('../../../repository/userRepository');
jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/ad/create', CreateAdController.createAd);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

const validPayload = {
  imovelId: 1,
  userId: 1,
  title: 'Apartamento legal',
  visibility: 'VISIBLE',
  description: 'Um belo apartamento com 3 quartos e 2 banheiros.',
  tipoAnuncio: 'ALUGUEL',
  price: 1200.0,
};

describe('POST /ad/create - Create Advertisement', () => {
  it('should return 400 if required fields are missing', async () => {
    const response = await request(fastify.server).post('/ad/create').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"imovelId" is required');
  });

  it('should return 400 if imovel does not exist', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/create')
      .send(validPayload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Property not found');
  });

  it('should return 400 if user does not exist', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(true);
    (UserRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/create')
      .send(validPayload);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 201 and the created ad if successful', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(true);
    (UserRepository.findById as jest.Mock).mockResolvedValue(true);
    (AnuncioRepository.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...validPayload,
    });

    const response = await request(fastify.server)
      .post('/ad/create')
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.title).toBe(validPayload.title);
  });

  it('should return 500 on unexpected error', async () => {
    (PropertyRepository.findById as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    );

    const response = await request(fastify.server)
      .post('/ad/create')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
