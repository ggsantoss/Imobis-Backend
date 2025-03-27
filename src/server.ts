import Fastify from 'fastify';

const app = Fastify();

app.listen({ port: 3000 }, () => {
  console.log(`Servidor rodando em na porta 3000`);
});
