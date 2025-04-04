import Fastify from 'fastify';
import { userRoutes } from './routes/auth/userAuth';
import { propertyRoutes } from './routes/property/property';
import { advertisementRoutes } from './routes/advertisement/advertisement';
import { paymentRoutes } from './routes/payment/payment';
import fastifyCors from '@fastify/cors';

const port = 3000;

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
    level: 'info',
  },
});

app.register(fastifyCors, {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

app.register(userRoutes, propertyRoutes);
app.register(advertisementRoutes, paymentRoutes);

console.log(`Configurando servidor na porta ${port}`);
app.listen({ port }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1); // Se houver erro, o processo é encerrado
  }
  console.log(`Servidor rodando em ${address}`);
});
