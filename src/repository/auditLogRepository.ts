import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ActionType } from '@prisma/client';

export class AuditLogRepository {
  static async createLog(data: {
    actorId?: number;
    targetId?: number;
    targetType?: string;
    action: ActionType;
    metadata?: Prisma.JsonValue;
  }) {
    try {
      const logData: any = {
        targetId: data.targetId,
        targetType: data.targetType ?? 'UNKNOWN',
        action: data.action,
        metadata: data.metadata || {},
      };

      if (data.actorId) {
        logData.actor = { connect: { id: data.actorId } };
      }

      return await prisma.auditLog.create({
        data: logData,
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw new Error('Failed to create audit log');
    }
  }
}
