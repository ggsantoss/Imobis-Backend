export const getAllSchema = {
  tags: ['Property'],
  summary: 'Get all properties',
  description:
    'Retrieves a paginated list of all properties. Supports optional query parameters for pagination.',
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 1,
        description: 'Page number for pagination',
        example: 1,
      },
      limit: {
        type: 'number',
        minimum: 1,
        description: 'Number of properties per page',
        example: 10,
      },
    },
  },
  response: {
    200: {
      description: 'List of properties with pagination details',
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'Property ID' },
              title: { type: 'string', description: 'Property title' },
              description: {
                type: 'string',
                description: 'Property description',
              },
              price: { type: 'number', description: 'Property price' },
              area: { type: 'number', description: 'Property area' },
              status: { type: 'string', description: 'Property status' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of properties',
            },
            page: { type: 'number', description: 'Current page number' },
            limit: {
              type: 'number',
              description: 'Number of properties per page',
            },
            totalPages: {
              type: 'number',
              description: 'Total number of pages',
            },
          },
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
          example: 'Error fetching properties',
        },
      },
    },
  },
};
