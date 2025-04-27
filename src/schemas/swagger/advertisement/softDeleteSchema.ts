export const softDeleteSchema = {
  tags: ['Advertisement'],
  summary: 'Soft delete advertisement by ID',
  description:
    'Soft deletes (hides) an advertisement by marking it as invisible instead of removing it from the database.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the advertisement to soft delete',
        example: '1',
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Advertisement successfully removed (soft delete)',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ad successfully removed' },
        ad: {
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
              example: 'INVISIBLE',
            },
            description: {
              type: 'string',
              example: 'Spacious two-bedroom apartment near central park.',
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
      description: 'Invalid ID provided',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Invalid ID' },
      },
    },
    404: {
      description: 'Advertisement not found',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Ad not found' },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'An error occurred while trying to remove the ad',
        },
      },
    },
  },
};
