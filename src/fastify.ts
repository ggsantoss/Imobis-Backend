import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyHelmet from '@fastify/helmet';

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'SYS:standard',
          colorize: true,
          ignore: 'pid,hostname',
        },
      },
    },
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  app.register(rateLimit, {
    max: 5,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
    ban: 3,
  });

  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    xFrameOptions: { action: 'deny' },
  });

  app.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin || origin === 'http://localhost:3001') {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  app.get('/', async () => ({ hello: 'world' }));

  app.post('/users/register', async (request, reply) => {
    return { success: true };
  });

  app.post('/ads/create', {
    handler: async (request) => {
      return { success: true, data: request.body };
    },
  });

  return app;
};

const app = buildApp();
export default app;
