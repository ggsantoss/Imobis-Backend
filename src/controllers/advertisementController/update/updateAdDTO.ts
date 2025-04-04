import { AdVisibility } from '@prisma/client';

export interface updateAdRequestDTO {
  title?: string;
  description?: string;
  tipoAnuncio?: 'ALUGUEL' | 'COMPRA';
  imovelId?: number;
  userId?: number;
  price?: number;
  status?: AdVisibility;
}
