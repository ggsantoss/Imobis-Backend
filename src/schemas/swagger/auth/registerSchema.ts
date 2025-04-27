export const registerSchema = {
  tags: ['Authentication'],
  summary: 'Register a new user',
  description:
    'Registers a new user by validating the user input (email, password, name, phone, and address), hashing the password, and saving the user to the database.',
  body: {
    type: 'object',
    required: ['email', 'password', 'name'],
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
      name: {
        type: 'string',
        minLength: 3,
        description: "User's full name",
        default: 'John Doe',
      },
      phone: {
        type: 'string',
        description: "User's phone number",
        default: '123-456-7890',
      },
      address: {
        type: 'string',
        description: "User's address",
        default: '123 Main St, City, Country',
      },
    },
  },
  response: {
    201: {
      description: 'User successfully registered',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'User ID',
        },
        email: {
          type: 'string',
          description: 'User email',
        },
        name: {
          type: 'string',
          description: 'User name',
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
    400: {
      description: 'Bad request, validation error or email already in use',
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
