import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import request from 'supertest';
import { CreateAdController } from './createAdController';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { UserRepository } from '../../../repository/userRepository';
import { AdRepository } from '../../../repository/advertisementRepository';
import { JwtUtils } from '../../../utils/jwt';
import { OrganizationRepository } from '../../../repository/organizationRepository';
import { OrganizationUserRepository } from '../../../repository/organizationUserRepository';

jest.mock('../../../repository/propertyRepository');
jest.mock('../../../repository/userRepository');
jest.mock('../../../repository/advertisementRepository');
jest.mock('../../../utils/jwt');
jest.mock('../../../repository/organizationRepository');
jest.mock('../../../repository/organizationUserRepository');

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
  propertyId: 1,
  title: 'Nice Apartment',
  visibility: 'VISIBLE',
  description: 'A beautiful apartment with 3 bedrooms and 2 bathrooms.',
  adType: 'RENT',
  organizationId: 1,
  price: 1200.0,
};

const validToken = 'Bearer faketoken';

beforeEach(() => {
  jest.clearAllMocks();
  (JwtUtils.verifyToken as jest.Mock).mockReturnValue({ userId: 1 });
});

describe('POST /ad/create - Create Advertisement', () => {
  it('should return 422 if required fields are missing or invalid', async () => {
    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send({});

    expect(response.status).toBe(422);
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(fastify.server)
      .post('/ad/create')
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Missing or invalid authorization header');
  });

  it('should return 401 if token is invalid', async () => {
    (JwtUtils.verifyToken as jest.Mock).mockReturnValue(null);

    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired token');
  });

  it('should return 404 if property does not exist', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send(validPayload);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Property not found');
  });

  it('should return 404 if user does not exist', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (UserRepository.findById as jest.Mock).mockResolvedValue(null);

    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send(validPayload);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found');
  });

  it('should return 409 if property already listed in an advertisement', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue({
      id: 1,
      organizationId: 1,
    });
    (UserRepository.findById as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });
    (OrganizationRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (OrganizationUserRepository.alreadyInOrg as jest.Mock).mockResolvedValue({
      id: 1,
    });
    (AdRepository.findAdByPropertyId as jest.Mock).mockResolvedValue({
      id: 123,
    });

    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send(validPayload);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe(
      'Property is already listed in an advertisement',
    );
  });

  it('should return 201 and the created ad if successful', async () => {
    (PropertyRepository.findById as jest.Mock).mockResolvedValue({
      id: 1,
      organizationId: 1,
    });
    (UserRepository.findById as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });
    (OrganizationRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (OrganizationUserRepository.alreadyInOrg as jest.Mock).mockResolvedValue({
      id: 1,
    });
    (AdRepository.findAdByPropertyId as jest.Mock).mockResolvedValue(null);
    (AdRepository.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...validPayload,
      userId: 1,
    });

    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.title).toBe(validPayload.title);
  });

  it('should return 500 on unexpected error', async () => {
    (PropertyRepository.findById as jest.Mock).mockImplementation(() => {
      throw new Error('DB error');
    });

    const response = await request(fastify.server)
      .post('/ad/create')
      .set('Authorization', validToken)
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
});
