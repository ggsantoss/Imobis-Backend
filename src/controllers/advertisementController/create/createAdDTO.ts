export interface createAdDTO {
  propertyId: number;
  title: string;
  visibility: 'VISIBLE' | 'INVISIBLE';
  description: string;
  adType: 'RENT' | 'SALE';
  price?: number;
}
