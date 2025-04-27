import { FastifyReply, FastifyRequest } from 'fastify';
import { AuditLogRepository } from '../repository/auditLogRepository';
import { JwtUtils } from '../utils/jwt';
import { ActionType } from '@prisma/client';

export async function auditLogMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    let userId: number | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = JwtUtils.verifyToken(token) as { userId: number };
        userId = decoded.userId;
      } catch (e) {}
    }

    const getActionType = (method: string): ActionType => {
      switch (method.toUpperCase()) {
        case 'POST':
          return ActionType.CREATE;
        case 'GET':
          return ActionType.VIEW;
        case 'PUT':
        case 'PATCH':
          return ActionType.UPDATE;
        case 'DELETE':
          return ActionType.DELETE;
        default:
          return ActionType.VIEW;
      }
    };

    let targetId: number | undefined = undefined;
    if (req.params && typeof req.params === 'object' && 'id' in req.params) {
      targetId = parseInt((req.params as any).id, 10);
    } else if (req.body && typeof req.body === 'object' && 'id' in req.body) {
      targetId = parseInt((req.body as any).id, 10);
    }

    const urlParts = req.url.split('/').filter(Boolean);
    const targetType = urlParts[0]?.toUpperCase() ?? 'UNKNOWN';

    const auditData = (req as any).auditData ?? {};

    const data = await AuditLogRepository.createLog({
      actorId: auditData.actorId ?? userId ?? null,
      targetId: auditData.targetId ?? targetId,
      targetType: auditData.targetType ?? targetType,
      action: auditData.action ?? getActionType(req.method),
      metadata: {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
        ...auditData.metadata,
      },
    });

    console.log('Audit log created:', data);
  } catch (err) {
    console.error('[auditLogMiddleware] Error:', err);
  }
}
