export const createAdSchema = {
  tags: ['Advertisement'],
  summary: 'Create new advertisement',
  description: 'Creates a new advertisement linked to a property and a user.',
  body: {
    type: 'object',
    properties: {
      imovelId: {
        type: 'number',
        minimum: 1,
        description: 'ID of the property',
        example: 1,
      },
      userId: {
        type: 'number',
        minimum: 1,
        description: 'ID of the user creating the ad',
        example: 1,
      },
      title: {
        type: 'string',
        minLength: 3,
        description: 'Title of the advertisement',
        example: 'Beautiful Apartment in Downtown',
      },
      visibility: {
        type: 'string',
        enum: ['VISIBLE', 'INVISIBLE'],
        description: 'Visibility of the advertisement',
        example: 'PUBLIC',
      },
      description: {
        type: 'string',
        minLength: 10,
        description: 'Detailed description of the advertisement',
        example: 'Spacious two-bedroom apartment near central park.',
      },
      tipoAnuncio: {
        type: 'string',
        enum: ['ALUGUEL', 'COMPRA'],
        description: 'Type of advertisement (Rent or Sale)',
        example: 'COMPRA',
      },
      price: {
        type: 'number',
        description: 'Price of the property (optional)',
        example: 250000,
      },
    },
    required: ['imovelId', 'userId', 'title', 'description', 'tipoAnuncio'],
    additionalProperties: false,
  },
  response: {
    201: {
      description: 'Advertisement successfully created',
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        visibility: { type: 'string' },
        description: { type: 'string' },
        tipoAnuncio: { type: 'string' },
        price: { type: 'number' },
        userId: { type: 'number' },
        imovelId: { type: 'number' },
      },
    },
    400: {
      description: 'Invalid advertisement data',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Title is required' },
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
