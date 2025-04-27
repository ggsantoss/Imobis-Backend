export const updateSchema = {
  tags: ['Advertisement'],
  summary: 'Update advertisement by ID',
  description:
    'Updates an existing advertisement with new data. Fields are optional, and only the provided fields will be updated.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the advertisement to update',
        example: '1',
      },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 3,
        description: 'Title of the advertisement',
        example: 'Updated Beautiful Apartment',
      },
      description: {
        type: 'string',
        minLength: 5,
        description: 'Updated description of the advertisement',
        example: 'Updated spacious two-bedroom apartment with new amenities.',
      },
      tipoAnuncio: {
        type: 'string',
        enum: ['ALUGUEL', 'COMPRA'],
        description: 'Type of advertisement (Rent or Sale)',
        example: 'ALUGUEL',
      },
      imovelId: {
        type: 'number',
        description: 'ID of the property related to the advertisement',
        example: 2,
      },
      userId: {
        type: 'number',
        description: 'ID of the user updating the ad',
        example: 1,
      },
      price: {
        type: 'number',
        description: 'Updated price of the property',
        example: 300000,
      },
      status: {
        type: 'string',
        enum: ['VISIBLE', 'INVISIBLE'],
        description: 'Visibility status of the advertisement',
        example: 'VISIBLE',
      },
    },
    required: [],
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Advertisement successfully updated',
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        title: { type: 'string', example: 'Updated Beautiful Apartment' },
        description: {
          type: 'string',
          example: 'Updated spacious two-bedroom apartment with new amenities.',
        },
        tipoAnuncio: {
          type: 'string',
          enum: ['ALUGUEL', 'COMPRA'],
          example: 'ALUGUEL',
        },
        price: { type: 'number', example: 300000 },
        userId: { type: 'number', example: 1 },
        imovelId: { type: 'number', example: 2 },
        status: {
          type: 'string',
          enum: ['VISIBLE', 'INVISIBLE'],
          example: 'VISIBLE',
        },
      },
    },
    400: {
      description: 'Invalid request data',
      type: 'object',
      properties: {
        error: { type: 'string', example: '"title" must be a string' },
      },
    },
    404: {
      description: 'Advertisement not found',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Advertisement not found' },
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
