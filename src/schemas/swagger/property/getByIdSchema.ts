export const getByIdSchema = {
  tags: ['Property'],
  summary: 'Get a property by ID',
  description:
    'Retrieves a single property by its ID. If found, caches the result for faster future access.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        minimum: 1,
        description: 'Unique ID of the property',
        example: 1,
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Property details',
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Property ID' },
        title: { type: 'string', description: 'Property title' },
        description: { type: 'string', description: 'Property description' },
        price: { type: 'number', description: 'Property price' },
        area: { type: 'number', description: 'Property area' },
        status: { type: 'string', description: 'Property status' },
        // Add any extra fields your Property model has
      },
    },
    400: {
      description: 'Invalid property ID',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'Invalid property ID',
        },
      },
    },
    404: {
      description: 'Property not found',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'Property not found',
        },
      },
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'Something went wrong',
        },
        details: {
          type: 'object',
          description: 'Detailed error object',
        },
      },
    },
  },
};
