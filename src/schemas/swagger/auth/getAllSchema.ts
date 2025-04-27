export const getAllUsersSchema = {
  tags: ['User'],
  summary: 'Get all users with pagination',
  description:
    'Retrieves a paginated list of all users. Accepts query parameters to specify the page number and the number of users per page.',
  parameters: [
    {
      name: 'page',
      in: 'query',
      description: 'The page number to retrieve (default is 1)',
      schema: {
        type: 'string',
        example: '1',
      },
    },
    {
      name: 'limit',
      in: 'query',
      description: 'The number of users per page (default is 10)',
      schema: {
        type: 'string',
        example: '10',
      },
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    200: {
      description: 'List of users with pagination data',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
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
        },
        pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of users',
            },
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            perPage: {
              type: 'integer',
              description: 'Number of users per page',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages available',
            },
          },
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description:
            'Error message indicating the query parameters are invalid',
        },
      },
    },
    500: {
      description: 'Internal server error',
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message for server-related issues',
        },
      },
    },
  },
};
