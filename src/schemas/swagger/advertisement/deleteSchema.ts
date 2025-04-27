export const deleteSchema = {
  tags: ['Advertisement'],
  summary: 'Delete advertisement',
  description: 'Deletes an advertisement by its ID.',
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID of the advertisement to delete',
        example: 1,
      },
    },
    required: ['id'],
  },
  response: {
    200: {
      description: 'Advertisement successfully deleted',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Advertisement deleted successfully',
        },
      },
    },
    400: {
      description: 'Invalid ID parameter',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'id must be a number' },
      },
    },
    404: {
      description: 'Advertisement not found',
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Advertisement not found' },
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
