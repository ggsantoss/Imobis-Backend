export const logoutSchema = {
  tags: ['Authentication'],
  summary: 'Logout and blacklist the user token',
  description:
    'Logs out the user by adding the token to the blacklist, preventing further use of the token for authentication.',
  headers: {
    type: 'object',
    required: ['Authorization'],
    properties: {
      Authorization: {
        type: 'string',
        description: 'Bearer token used for authentication',
        default: 'Bearer token_string',
      },
    },
  },
  response: {
    200: {
      description: 'Token successfully blacklisted',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Success message',
          default: 'Token blacklisted successfully',
        },
      },
    },
    401: {
      description: 'Unauthorized, token not provided or invalid format',
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
