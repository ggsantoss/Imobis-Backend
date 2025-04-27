export const getAllSchema = {
  tags: ['Advertisement'],
  summary: 'Get all advertisements with optional filters',
  description:
    'Retrieves a paginated list of advertisements with optional filters such as type, price range, city, user, and property.',
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'string',
        description: 'Page number for pagination (default is 1)',
        example: '1',
      },
      limit: {
        type: 'string',
        description: 'Number of items per page (default is 10)',
        example: '10',
      },
      tipoAnuncio: {
        type: 'string',
        enum: ['ALUGUEL', 'COMPRA'],
        description: 'Type of advertisement (Rent or Sale)',
        example: 'COMPRA',
      },
      tipoImovel: {
        type: 'string',
        description: 'Type of property (e.g., apartment, house)',
        example: 'Apartment',
      },
      city: {
        type: 'string',
        description: 'City where the property is located',
        example: 'New York',
      },
      minPrice: {
        type: 'string',
        description: 'Minimum price filter',
        example: '100000',
      },
      maxPrice: {
        type: 'string',
        description: 'Maximum price filter',
        example: '500000',
      },
      userId: {
        type: 'string',
        description: 'User ID to filter ads by user',
        example: '1',
      },
      imovelId: {
        type: 'string',
        description: 'Property ID to filter ads by property',
        example: '5',
      },
    },
  },
  response: {
    200: {
      description: 'List of advertisements with pagination details',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 10 },
              title: { type: 'string', example: 'Luxury Condo in Downtown' },
              visibility: {
                type: 'string',
                enum: ['VISIBLE', 'INVISIBLE'],
                example: 'VISIBLE',
              },
              description: {
                type: 'string',
                example: 'Modern condo close to public transport.',
              },
              tipoAnuncio: {
                type: 'string',
                enum: ['ALUGUEL', 'COMPRA'],
                example: 'ALUGUEL',
              },
              price: { type: 'number', example: 3000 },
              userId: { type: 'number', example: 2 },
              imovelId: { type: 'number', example: 8 },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Invalid page or limit' },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'string',
          example: 'Error fetching ads. Please try again later.',
        },
      },
    },
  },
};
