export const deleteSchema = {
  tags: ['Property'],
  summary: 'Delete a property',
  description:
    'Deletes a property by ID. If the property is not found, returns a 404 error. Handles validation and database errors.',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'number',
        description: 'ID of the property to delete',
        example: 1,
      },
    },
  },
  response: {
    200: {
      description: 'Property successfully deleted',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Success message',
          example: 'Property deleted successfully',
        },
      },
    },
    400: {
      description: 'Bad request, validation error',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Validation error message',
          example: 'id must be a number',
        },
      },
    },
    404: {
      description: 'Property not found',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Not found error message',
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
          description: 'Internal server error message',
          example: 'Something went wrong',
        },
      },
    },
  },
};
