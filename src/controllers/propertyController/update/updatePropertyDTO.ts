import { ImovelStatus } from '@prisma/client';

export interface updatePropertyRequestDTO {
  title?: string;
  description?: string;
  price?: number;
  imovelId?: number;
  userId?: number;
  status?: ImovelStatus;
}
