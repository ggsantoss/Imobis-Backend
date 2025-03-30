import Fastify from 'fastify';
import { userRoutes } from './routes/auth/userAuth';
import { propertyRoutes } from './routes/property/property';
import { advertisementRoutes } from './routes/advertisement/advertisement';
import { paymentRoutes } from './routes/payment/payment';

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

app.register(userRoutes, propertyRoutes);
app.register(advertisementRoutes, paymentRoutes);

app.listen({ port }, () => {
  console.log(`Servidor rodando em na porta ${port}`);
});
