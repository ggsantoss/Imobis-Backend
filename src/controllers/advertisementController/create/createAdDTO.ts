export interface createAdDTO {
  propertyId: number;
  title: string;
  organizationId?: number;
  visibility: 'VISIBLE' | 'INVISIBLE';
  description: string;
  adType: 'RENT' | 'SALE';
  price?: number;
}
