import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { ResetPasswordController } from './resetPasswordController';
import { UserRepository } from '../../../repository/userRepository';
import { JwtUtils } from '../../../utils/jwt';
import { BcryptUtils } from '../../../utils/bcrypt';
import { BlacklistRepository } from '../../../repository/blackListRepository';

jest.mock('../../../repository/userRepository');
jest.mock('../../../utils/jwt');
jest.mock('../../../utils/bcrypt');
jest.mock('../../../repository/blackListRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.post('/auth/reset-password', ResetPasswordController.resetPassword);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('POST /auth/reset-password - Reset Password', () => {
  it('should return 400 if the token is missing', async () => {
    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ newPassword: 'newPassword123' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('"token" is required');
  });

  it('should return 400 if the new password is too short', async () => {
    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ token: 'validToken', newPassword: '123' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      '"newPassword" length must be at least 6 characters long',
    );
  });

  it('should return 400 if the token is invalid', async () => {
    (JwtUtils.verifyRecoveryToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ token: 'invalidToken', newPassword: 'newPassword123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid token');
  });

  it('should return 404 if the user is not found', async () => {
    (JwtUtils.verifyRecoveryToken as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
    });
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ token: 'validToken', newPassword: 'newPassword123' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 404 if the token is blacklisted', async () => {
    (JwtUtils.verifyRecoveryToken as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
    });
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });
    (BlacklistRepository.isTokenBlacklisted as jest.Mock).mockResolvedValue(
      true,
    );

    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ token: 'blacklistedToken', newPassword: 'newPassword123' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Token expired or invalid!');
  });

  it('should return 200 if the password is updated successfully', async () => {
    const mockUser = { id: 1, email: 'user@example.com' };
    (JwtUtils.verifyRecoveryToken as jest.Mock).mockResolvedValue({
      email: mockUser.email,
    });
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (BlacklistRepository.isTokenBlacklisted as jest.Mock).mockResolvedValue(
      false,
    );
    (BcryptUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (UserRepository.updatePassword as jest.Mock).mockResolvedValue(true);
    (BlacklistRepository.addToken as jest.Mock).mockResolvedValue(true);

    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ token: 'validToken', newPassword: 'newPassword123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password updated successfully');
  });

  it('should return 500 if there is an unexpected error', async () => {
    (JwtUtils.verifyRecoveryToken as jest.Mock).mockResolvedValue({
      email: 'user@example.com',
    });
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });
    (BlacklistRepository.isTokenBlacklisted as jest.Mock).mockResolvedValue(
      false,
    );
    (BcryptUtils.hashPassword as jest.Mock).mockRejectedValue(
      new Error('Hashing error'),
    );

    const response = await request(fastify.server)
      .post('/auth/reset-password')
      .send({ token: 'validToken', newPassword: 'newPassword123' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong');
  });
});
