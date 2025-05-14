import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtUtils } from '../utils/jwt';
import { envConfig } from '../config/envConfig';

export async function verifyAdmin(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JwtUtils.verifyToken(token, envConfig.JWT_SECRET) as {
      role?: string;
    };

    if (decoded.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Access denied. Admins only.' });
    }

    (req as any).user = decoded;
  } catch (err) {
    console.log('[ERROR]: ' + err);
    return reply.status(403).send({ error: 'Invalid or expired token' });
  }
}
