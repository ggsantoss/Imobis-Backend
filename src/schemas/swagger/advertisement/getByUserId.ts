export const getByUserIdSchema = {
  tags: ['Advertisement'],
  summary: 'Get advertisements by user ID',
  description: 'Retrieves all advertisements associated with a specific user.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        minimum: 1,
        description: 'ID of the user',
        example: 1,
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'List of advertisements for the specified user',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 10 },
          title: { type: 'string', example: 'Spacious House for Sale' },
          visibility: {
            type: 'string',
            enum: ['VISIBLE', 'INVISIBLE'],
            example: 'VISIBLE',
          },
          description: {
            type: 'string',
            example: 'A wonderful house with garden.',
          },
          tipoAnuncio: {
            type: 'string',
            enum: ['ALUGUEL', 'COMPRA'],
            example: 'COMPRA',
          },
          price: { type: 'number', example: 450000 },
          userId: { type: 'number', example: 1 },
          imovelId: { type: 'number', example: 5 },
        },
      },
    },
    404: {
      description: 'User or advertisements not found',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'No advertisements found for this user',
        },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Something went wrong' },
      },
    },
  },
};
