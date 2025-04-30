export enum PropertyStatus {
  DISPONIVEL = 'AVAILABLE',
  VENDIDO = 'SOLD',
  ALUGADO = 'RENTED',
}

export interface createPropertyRequestDTO {
  title: string;
  description: string;
  price: number;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  area: number;
  status: PropertyStatus;
  userId: number;
  images?: string[];
}
