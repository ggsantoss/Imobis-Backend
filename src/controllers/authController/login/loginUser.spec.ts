import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { loginUserController } from './loginUserController';
import { UserRepository } from '../../../repository/userRepository';
import { BcryptUtils } from '../../../utils/bcrypt';
import { JwtUtils } from '../../../utils/jwt';

jest.mock('../../../repository/userRepository');
jest.mock('../../../utils/bcrypt');
jest.mock('../../../utils/jwt');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/auth/login', loginUserController.loginUser);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /auth/login - Rigorosos e Restritos', () => {
  it('should return 400 if the email is invalid', async () => {
    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'invalid-email', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"email" must be a valid email');
  });

  it('should return 400 if the password is shorter than the minimum length', async () => {
    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: '123' }); // Senha com menos de 6 caracteres

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      '"password" length must be at least 6 characters long',
    );
  });

  it('should return 400 if the email does not exist', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'notfound@example.com', password: 'validpassword' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('should return 400 if the password is incorrect', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashedpassword',
    });

    (BcryptUtils.comparePassword as jest.Mock).mockResolvedValue(false);

    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('should return 200 and a JWT token if the login is successful', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashedpassword',
    });

    (BcryptUtils.comparePassword as jest.Mock).mockResolvedValue(true);

    const mockToken = 'mockedJwtToken';
    (JwtUtils.generateToken as jest.Mock).mockReturnValue(mockToken);

    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'validpassword' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe(mockToken);
  });

  it('should return 500 in case of an unexpected error', async () => {
    (UserRepository.findByEmail as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'validpassword' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });

  it('should return 400 for a missing email field', async () => {
    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ password: 'validpassword' }); // Falta o campo email

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"email" is required');
  });

  it('should return 400 for a missing password field', async () => {
    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'user@example.com' }); // Falta o campo password

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"password" is required');
  });

  it('should return 400 for an email with extra spaces', async () => {
    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: ' user@example.com ', password: 'validpassword' }); // Email com espaços extras

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"email" must be a valid email');
  });

  it('should return 500 if the password comparison throws an error', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashedpassword',
    });

    (BcryptUtils.comparePassword as jest.Mock).mockRejectedValue(
      new Error('Bcrypt error'),
    );

    const response = await request(fastify.server)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'validpassword' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
