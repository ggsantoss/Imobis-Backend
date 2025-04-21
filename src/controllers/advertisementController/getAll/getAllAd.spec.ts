import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { GetAllAdController } from './getAllAdController';
import { AnuncioRepository } from '../../../repository/advertisementRepository';

jest.mock('../../../repository/advertisementRepository');

let fastify: FastifyInstance;

beforeAll(async () => {
  fastify = Fastify();
  fastify.get('/ads', GetAllAdController.getAllAd);
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('GET /ads - Get All Ads', () => {
  const fakeAds = [
    {
      id: 1,
      userId: 2,
      title: 'Apartamento legal',
      description: 'Descrição do anúncio',
      price: 1200.0,
    },
    {
      id: 2,
      userId: 3,
      title: 'Casa maravilhosa',
      description: 'Descrição do anúncio',
      price: 1500.0,
    },
  ];

  it('should return 400 if page or limit is invalid', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ads?page=abc&limit=xyz',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Invalid page or limit');
  });

  it('should return 500 if there is a server error', async () => {
    (AnuncioRepository.getAllAnuncios as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().error).toBe(
      'Error fetching ads. Please try again later.',
    );
  });

  it('should return ads with pagination', async () => {
    (AnuncioRepository.getAllAnuncios as jest.Mock).mockResolvedValue({
      anuncios: fakeAds,
      total: 2,
      totalPages: 1,
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/ads?page=1&limit=10',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(fakeAds);
    expect(response.json().pagination).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('should apply filters and return the correct ads', async () => {
    const filters = {
      page: '1',
      limit: '10',
      tipoAnuncio: 'venda',
      tipoImovel: 'apartamento',
      city: 'São Paulo',
      minPrice: '1000',
      maxPrice: '2000',
      userId: '2',
      imovelId: '1',
    };

    (AnuncioRepository.getAllAnuncios as jest.Mock).mockResolvedValue({
      anuncios: fakeAds,
      total: 2,
      totalPages: 1,
    });

    const response = await fastify.inject({
      method: 'GET',
      url: `/ads?page=${filters.page}&limit=${filters.limit}&tipoAnuncio=${filters.tipoAnuncio}&tipoImovel=${filters.tipoImovel}&city=${filters.city}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&userId=${filters.userId}&imovelId=${filters.imovelId}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(fakeAds);
  });
});
