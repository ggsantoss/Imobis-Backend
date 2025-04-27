export const resetPasswordSchema = {
  tags: ['Authentication'],
  summary: 'Reset password using a recovery token',
  description:
    'Allows the user to reset their password using a recovery token. The token must be valid and not expired, and the new password must meet the minimum length requirement.',
  body: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'The recovery token sent to the user’s email',
        example: 'recovery-token-example',
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        description: 'The new password the user wants to set',
        example: 'newSecurePassword123',
      },
    },
    required: ['token', 'newPassword'],
  },
  response: {
    200: {
      description: 'Password successfully updated',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password updated successfully' },
      },
    },
    400: {
      description: 'Invalid or expired token',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Token expired or invalid!' },
      },
    },
    404: {
      description: 'User not found or token is blacklisted',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'User not found' },
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
