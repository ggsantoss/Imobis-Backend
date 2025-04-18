import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { registerUserController } from './registerUserController';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';

jest.mock('../../../repository/userRepository');
jest.mock('../../../utils/bcrypt');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/auth/register', registerUserController.createUser);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /auth/register - Register User', () => {
  it('should return 400 if the email is invalid', async () => {
    const response = await request(fastify.server)
      .post('/auth/register')
      .send({ email: 'invalidEmail', password: '123456', name: 'John' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"email" must be a valid email');
  });

  it('should return 400 if the password is too short', async () => {
    const response = await request(fastify.server)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '123', name: 'John' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      '"password" length must be at least 6 characters long',
    );
  });

  it('should return 400 if the name is too short', async () => {
    const response = await request(fastify.server)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '123456', name: 'Jo' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      '"name" length must be at least 3 characters long',
    );
  });

  it('should return 400 if the email is already in use', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(true);
    const response = await request(fastify.server)
      .post('/auth/register')
      .send({
        email: 'existing@example.com',
        password: '123456',
        name: 'John',
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is already in use');
  });

  it('should return 201 and create a new user if the registration is successful', async () => {
    const userPayload = {
      email: 'newuser@example.com',
      password: '123456',
      name: 'New User',
      phone: '1234567890',
      address: '123 Test St.',
    };

    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (BcryptUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (UserRepository.create as jest.Mock).mockResolvedValue({
      id: 1,
      email: userPayload.email,
      name: userPayload.name,
      phone: userPayload.phone,
      address: userPayload.address,
    });

    const response = await request(fastify.server)
      .post('/auth/register')
      .send(userPayload);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userPayload.email);
    expect(response.body.name).toBe(userPayload.name);
  });

  it('should return 500 if there is an unexpected error', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (BcryptUtils.hashPassword as jest.Mock).mockRejectedValue(
      new Error('Hashing error'),
    );

    const response = await request(fastify.server)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '123456', name: 'John' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
