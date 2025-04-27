export const getByIdSchema = {
  tags: ['Advertisement'],
  summary: 'Get advertisement by ID',
  description:
    'Fetches a single advertisement by its ID, using cache for faster retrieval.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the advertisement to fetch',
        example: '1',
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Advertisement retrieved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: {
              type: 'string',
              example: 'Beautiful Apartment in Downtown',
            },
            visibility: {
              type: 'string',
              enum: ['VISIBLE', 'INVISIBLE'],
              example: 'VISIBLE',
            },
            description: {
              type: 'string',
              example: 'Spacious two-bedroom apartment near the central park.',
            },
            tipoAnuncio: {
              type: 'string',
              enum: ['ALUGUEL', 'COMPRA'],
              example: 'ALUGUEL',
            },
            price: { type: 'number', example: 1500 },
            userId: { type: 'number', example: 1 },
            imovelId: { type: 'number', example: 2 },
          },
        },
      },
    },
    400: {
      description: 'Invalid advertisement ID',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Invalid advertisement ID' },
      },
    },
    404: {
      description: 'Advertisement not found',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Advertisement not found' },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string', example: 'Something went wrong' },
        details: { type: 'string', example: 'Error message details' },
      },
    },
  },
};
