import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { registerUserController } from './registerUserController';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';
import { UserAddressRepository } from '../../../repository/userAddressRepository';

jest.mock('../../../repository/userRepository');
jest.mock('../../../utils/bcrypt');
jest.mock('../../../repository/userAddressRepository');

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
    const response = await request(fastify.server).post('/auth/register').send({
      email: 'invalidEmail',
      password: '123456',
      name: 'John',
      cpf: '12345678900',
      phone: '1234567890',
      street: 'Main St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'Country',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"email" must be a valid email');
  });

  it('should return 400 if the password is too short', async () => {
    const response = await request(fastify.server).post('/auth/register').send({
      email: 'test@example.com',
      password: '123',
      name: 'John',
      cpf: '12345678900',
      phone: '1234567890',
      street: 'Main St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'Country',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      '"password" length must be at least 6 characters long',
    );
  });

  it('should return 400 if the name is too short', async () => {
    const response = await request(fastify.server).post('/auth/register').send({
      email: 'test@example.com',
      password: '123456',
      name: 'Jo',
      cpf: '12345678900',
      phone: '1234567890',
      street: 'Main St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'Country',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      '"name" length must be at least 3 characters long',
    );
  });

  it('should return 400 if the email is already in use', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

    const response = await request(fastify.server).post('/auth/register').send({
      email: 'existing@example.com',
      password: '123456',
      name: 'John',
      cpf: '12345678900',
      phone: '1234567890',
      street: 'Main St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'Country',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is already in use');
  });

  it('should return 201 and create a new user if registration is successful', async () => {
    const userPayload = {
      email: 'newuser@example.com',
      password: '123456',
      name: 'New User',
      phone: '1234567890',
      cpf: '12345678900',
      street: 'Main St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'Country',
    };

    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (BcryptUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (UserAddressRepository.createUserAddress as jest.Mock).mockResolvedValue({
      id: 1,
      street: userPayload.street,
      city: userPayload.city,
      state: userPayload.state,
      zipCode: userPayload.zipCode,
      country: userPayload.country,
    });
    (UserRepository.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...userPayload,
      password: undefined,
      address: {
        id: 1,
        street: userPayload.street,
        city: userPayload.city,
        state: userPayload.state,
        zipCode: userPayload.zipCode,
        country: userPayload.country,
      },
    });

    const response = await request(fastify.server)
      .post('/auth/register')
      .send(userPayload);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userPayload.email);
    expect(response.body.name).toBe(userPayload.name);
    expect(response.body.address.street).toBe(userPayload.street);
    expect(response.body.address.city).toBe(userPayload.city);
    expect(response.body.address.state).toBe(userPayload.state);
    expect(response.body.address.zipCode).toBe(userPayload.zipCode);
    expect(response.body.address.country).toBe(userPayload.country);
  });

  it('should return 500 if there is an unexpected error', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (BcryptUtils.hashPassword as jest.Mock).mockRejectedValue(
      new Error('Hashing error'),
    );

    const response = await request(fastify.server).post('/auth/register').send({
      email: 'test@example.com',
      password: '123456',
      name: 'John',
      cpf: '12345678900',
      phone: '1234567890',
      street: 'Main St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'Country',
    });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
