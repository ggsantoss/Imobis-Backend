import { FastifyRequest } from 'fastify';

export function setAuditData(
  req: FastifyRequest,
  targetId?: number | null,
  targetType?: string,
  success?: boolean,
  metadata?: object,
) {
  (req as any).auditData = {
    targetId,
    targetType,
    action: success ? 'CREATE' : 'VIEW',
    metadata: {
      success,
      ip: req.ip,
      ...metadata,
    },
  };
}
