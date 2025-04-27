export const ForgotPasswordSchema = {
  tags: ['Authentication'],
  summary: 'Request to change a password',
  description:
    'Send to the API a request to change the password of a specified email',
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'user@example.com',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        details: { type: 'string' },
      },
      examples: [
        {
          message: 'Password recovery email sent',
          details: 'Please check your inbox for further instructions',
        },
      ],
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'string' },
      },
      examples: [
        {
          error: 'Valid email is required',
          details: 'Please provide a properly formatted email address',
        },
      ],
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'string' },
      },
      examples: [
        {
          error: 'Internal Server Error',
          details: 'Could not process password recovery request',
        },
      ],
    },
  },
};
