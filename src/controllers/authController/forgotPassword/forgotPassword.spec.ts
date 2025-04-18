import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { ForgotPasswordController } from './forgotPasswordController';
import { UserRepository } from '../../../repository/userRepository';
import { EmailService } from '../../../service/sendEmailService';

jest.mock('../../../repository/userRepository');
jest.mock('../../../service/sendEmailService');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post(
    '/auth/forgot-password',
    ForgotPasswordController.forgotPassword,
  );
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /auth/forgot-password - Rigorosos e Restritos', () => {
  it('should return 400 if the email is not provided', async () => {
    const response = await request(fastify.server)
      .post('/auth/forgot-password')
      .send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required');
  });

  it('should return 404 if the user is not found', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    const response = await request(fastify.server)
      .post('/auth/forgot-password')
      .send({ email: 'notfound@example.com' });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 200 and a success message if the email is sent successfully', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });
    (EmailService.sendPasswordRecoveryEmail as jest.Mock).mockResolvedValue(
      true,
    );
    const response = await request(fastify.server)
      .post('/auth/forgot-password')
      .send({ email: 'user@example.com' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password recovery email sent');
  });

  it('should return 500 if there is an unexpected error', async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });
    (EmailService.sendPasswordRecoveryEmail as jest.Mock).mockRejectedValue(
      new Error('Email service error'),
    );
    const response = await request(fastify.server)
      .post('/auth/forgot-password')
      .send({ email: 'user@example.com' });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
