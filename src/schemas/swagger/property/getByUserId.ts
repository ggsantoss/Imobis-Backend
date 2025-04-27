export const getByUserIdSchema = {
  tags: ['Property'],
  summary: 'Get properties by user ID',
  description: 'Retrieves all properties associated with a specific user ID.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        minimum: 1,
        description: 'Unique ID of the user',
        example: 1,
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'List of properties owned by the user',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Property ID' },
          title: { type: 'string', description: 'Property title' },
          description: { type: 'string', description: 'Property description' },
          price: { type: 'number', description: 'Property price' },
          area: { type: 'number', description: 'Property area' },
          status: { type: 'string', description: 'Property status' },
          userId: { type: 'number', description: 'ID of the owner user' },
        },
      },
    },
    400: {
      description: 'Invalid user ID',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'Invalid user ID',
        },
      },
    },
    404: {
      description: 'No properties found for the user',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          example: 'The user do not have any property',
        },
      },
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Something went wrong' },
        details: {
          type: 'object',
          description: 'Detailed error object',
        },
      },
    },
  },
};
