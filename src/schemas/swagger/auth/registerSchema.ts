export const registerSchema = {
  tags: ['Authentication'],
  summary: 'Register a new user',
  description:
    'Registers a new user by validating the user input (email, password, name, cpf, phone, and address data), hashing the password, and saving the user to the database.',
  body: {
    type: 'object',
    required: ['email', 'password', 'name', 'cpf', 'street', 'city', 'state', 'zipCode', 'country'],
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
      cpf: {
        type: 'string',
        pattern: '^[0-9]{11}$',
        description: "User's CPF (Brazilian identification number)",
        default: '12345678900',
      },
      street: {
        type: 'string',
        description: "User's street address",
        default: '123 Main St',
      },
      city: {
        type: 'string',
        description: "User's city",
        default: 'City',
      },
      state: {
        type: 'string',
        description: "User's state",
        default: 'State',
      },
      zipCode: {
        type: 'string',
        description: "User's postal code",
        default: '12345',
      },
      country: {
        type: 'string',
        description: "User's country",
        default: 'Country',
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
        cpf: {
          type: 'string',
          description: 'User CPF',
        },
        street: {
          type: 'string',
          description: 'Street address',
        },
        city: {
          type: 'string',
          description: 'City',
        },
        state: {
          type: 'string',
          description: 'State',
        },
        zipCode: {
          type: 'string',
          description: 'Postal code',
        },
        country: {
          type: 'string',
          description: 'Country',
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
