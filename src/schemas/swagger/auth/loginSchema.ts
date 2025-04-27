export const loginSchema = {
  tags: ['Authentication'],
  summary: 'User login',
  description:
    'Validates the user credentials (email and password) and returns a JWT token for authentication.',
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: "User's email address",
        default: 'user@example.com',
      },
      password: {
        type: 'string',
        minLength: 6,
        description: "User's password",
        default: 'password123',
      },
    },
  },
  response: {
    200: {
      description: 'Successful login, JWT token generated',
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT token generated for authentication',
        },
      },
    },
    400: {
      description: 'Invalid email or password',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message',
        },
      },
    },
    500: {
      description: 'Server error',
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
