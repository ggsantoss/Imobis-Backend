export const updateSchema = {
  tags: ['Property'],
  summary: 'Update property details',
  description: 'Updates the details of an existing property by its ID.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        minimum: 1,
        description: 'Unique ID of the property',
        example: 1,
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
        description: 'Title of the property',
      },
      description: {
        type: 'string',
        minLength: 5,
        description: 'Description of the property',
      },
      price: {
        type: 'number',
        description: 'Price of the property',
      },
      imovelId: {
        type: 'integer',
        description: 'ID of the property from the external system',
      },
      userId: {
        type: 'integer',
        description: 'ID of the user who owns the property',
      },
      status: {
        type: 'string',
        enum: ['DISPONIVEL', 'ALUGADO', 'VENDIDO'],
        description: 'Status of the property',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Successfully updated property',
      type: 'object',
      properties: {
        id: { type: 'integer' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        status: { type: 'string' },
        imovelId: { type: 'integer' },
        userId: { type: 'integer' },
      },
    },
    400: {
      description: 'Invalid property data',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Title is required' },
      },
    },
    404: {
      description: 'Property not found',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Property not found' },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Something went wrong' },
        details: { type: 'object' },
      },
    },
  },
};
