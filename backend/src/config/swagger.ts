import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'CineVerse AI API',
    version: '0.1.0',
    description: 'Full-stack SaaS movie recommendation platform powered by AI.',
    contact: {
      name: 'CineVerse Team',
    },
    license: {
      name: 'Private',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      OAuth2Google: {
        type: 'oauth2',
        description: 'Google OAuth 2.0',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: {
              openid: 'OpenID Connect',
              email: 'Email address',
              profile: 'User profile',
            },
          },
        },
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          backend: { type: 'string', example: 'healthy' },
          supabase: { type: 'string', example: 'connected' },
          prisma: { type: 'string', example: 'connected' },
          postgres: { type: 'string', example: 'connected' },
          cache: { type: 'string', example: 'connected' },
          tmdb: { type: 'string', example: 'configured' },
          gemini: { type: 'string', example: 'configured' },
          wikipedia: { type: 'string', example: 'configured' },
          version: { type: 'string', example: '0.1.0' },
          timestamp: { type: 'string', format: 'date-time' },
          latency: { type: 'string', example: '12ms' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
      AuthSessionResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'number', example: 3600 },
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string', nullable: true },
          avatarUrl: { type: 'string', nullable: true },
          emailVerified: { type: 'boolean' },
          authProvider: { type: 'string', enum: ['EMAIL', 'GOOGLE'] },
          role: { type: 'string', enum: ['USER', 'ADMIN', 'MODERATOR'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health Check',
        description: 'Returns the health status of the backend, PostgreSQL, cache, and external API configurations.',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'All required systems operational',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          '503': {
            description: 'One or more required systems unavailable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Creates a new user account with email and password via Supabase Auth, syncs to Prisma database.',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  fullName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSessionResponse' },
              },
            },
          },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        description: 'Authenticates user via Supabase Auth and returns access/refresh tokens with user data.',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSessionResponse' },
              },
            },
          },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout current session',
        description: 'Invalidates the current authentication session.',
        operationId: 'logout',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Logout successful' },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset email',
        description: 'Sends a password reset email to the specified address if an account exists.',
        operationId: 'forgotPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset email sent if account exists' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password',
        description: 'Updates the user password using a recovery token.',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  password: { type: 'string', minLength: 8 },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password updated successfully' },
          '400': { description: 'Invalid or missing token' },
        },
      },
    },
    '/auth/google': {
      get: {
        tags: ['Authentication'],
        summary: 'Google OAuth redirect URL',
        description: 'Returns the Supabase OAuth redirect URL for Google sign-in.',
        operationId: 'googleAuth',
        responses: {
          '200': {
            description: 'OAuth redirect URL',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        url: { type: 'string', format: 'uri' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user profile from the database.',
        operationId: 'getCurrentUser',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Authentication required' },
        },
      },
    },
    '/auth/profile': {
      put: {
        tags: ['Authentication'],
        summary: 'Update user profile',
        description: 'Updates the authenticated user\'s profile (full name, avatar).',
        operationId: 'updateProfile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', minLength: 2 },
                  avatarUrl: { type: 'string', format: 'uri', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Profile updated successfully' },
          '401': { description: 'Authentication required' },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [], // We define paths inline above rather than via JSDoc annotations
});
