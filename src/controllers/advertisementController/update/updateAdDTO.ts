import { AdVisibility } from '@prisma/client';

export interface UpdateAdRequestDTO {
  title?: string;
  description?: string;
  adType?: 'RENT' | 'SALE';
  propertyId?: number;
  userId?: number;
  price?: number;
  visibility?: AdVisibility;
}
