export const getUserByIdSchema = {
  tags: ['User'],
  summary: 'Get user by ID',
  description:
    'Retrieves user details by ID. If the user data is already cached, it will be returned from the cache. Otherwise, it will be fetched from the database and then cached for future requests.',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      description: 'The ID of the user to retrieve',
      schema: {
        type: 'string',
        example: '1',
      },
    },
  ],
  response: {
    200: {
      description: 'User data retrieved successfully',
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'User ID',
        },
        email: {
          type: 'string',
          description: 'User email address',
        },
        name: {
          type: 'string',
          description: 'User full name',
        },
        phone: {
          type: 'string',
          description: 'User phone number',
        },
        address: {
          type: 'string',
          description: 'User address',
        },
      },
    },
    400: {
      description: 'Invalid user ID',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message',
        },
      },
    },
    404: {
      description: 'User not found',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message',
        },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message',
        },
      },
    },
  },
};
