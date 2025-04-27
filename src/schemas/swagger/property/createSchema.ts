export const createSchema = {
  tags: ['Property'],
  summary: 'Create a new property',
  description:
    'Creates a new property by validating the input fields, checking if the user exists, creating an address, and saving the property to the database.',
  body: {
    type: 'object',
    required: [
      'title',
      'description',
      'price',
      'street',
      'city',
      'state',
      'country',
      'area',
      'status',
      'userId',
    ],
    properties: {
      title: {
        type: 'string',
        description: 'Title of the property',
        default: 'Beautiful House',
      },
      description: {
        type: 'string',
        description: 'Detailed description of the property',
        default: 'A beautiful 3-bedroom house with a pool.',
      },
      price: {
        type: 'number',
        description: 'Price of the property',
        default: 250000,
      },
      street: {
        type: 'string',
        description: 'Street address of the property',
        default: '456 Elm Street',
      },
      city: {
        type: 'string',
        description: 'City where the property is located',
        default: 'New York',
      },
      state: {
        type: 'string',
        description: 'State where the property is located',
        default: 'NY',
      },
      zipCode: {
        type: 'string',
        description: 'ZIP code of the property (optional)',
        default: '10001',
      },
      country: {
        type: 'string',
        description: 'Country where the property is located',
        default: 'USA',
      },
      area: {
        type: 'number',
        description: 'Area of the property in square meters',
        default: 120,
      },
      status: {
        type: 'string',
        enum: ['DISPONIVEL', 'VENDIDO', 'ALUGADO'],
        description: 'Current status of the property',
        default: 'DISPONIVEL',
      },
      userId: {
        type: 'number',
        description: 'ID of the user creating the property',
        default: 1,
      },
      images: {
        type: 'array',
        items: {
          type: 'string',
          description: 'Image URL',
          default: 'https://example.com/image.jpg',
        },
        description: 'Array of image URLs (optional)',
      },
    },
  },
  response: {
    201: {
      description: 'Property successfully created',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Property ID',
        },
        title: {
          type: 'string',
          description: 'Title of the property',
        },
        description: {
          type: 'string',
          description: 'Description of the property',
        },
        price: {
          type: 'number',
          description: 'Price of the property',
        },
        area: {
          type: 'number',
          description: 'Area of the property',
        },
        status: {
          type: 'string',
          description: 'Status of the property',
        },
        userId: {
          type: 'number',
          description: 'User ID linked to the property',
        },
        addressId: {
          type: 'string',
          description: 'Address ID linked to the property',
        },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Image ID' },
              url: { type: 'string', description: 'Image URL' },
            },
          },
          description: 'Array of images associated with the property',
        },
      },
    },
    400: {
      description: 'Bad request, validation error or user not found',
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
