export const deleteUserSchema = {
  tags: ['User'],
  summary: 'Delete a user by ID',
  description:
    'Deletes a user based on the provided user ID. The ID must be passed in the request body.',
  body: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'integer',
        description: 'ID of the user to delete',
        example: 1,
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    200: {
      description: 'User deleted successfully',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User deleted successfully',
        },
      },
    },
    400: {
      description: 'Invalid request body',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Validation error message',
          example: '"id" must be a number',
        },
      },
    },
    404: {
      description: 'User not found',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error when user does not exist',
          example: 'User not found',
        },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Unexpected server error',
          example: 'Something went wrong',
        },
      },
    },
  },
};
