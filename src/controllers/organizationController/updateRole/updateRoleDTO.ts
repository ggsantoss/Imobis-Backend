import { Role } from '@prisma/client';

export interface UpdateRoleRequestDTO {
  organizationId: number;
  role: Role;
}
