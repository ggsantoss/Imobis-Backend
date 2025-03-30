export enum PropertyStatus {
  DISPONIVEL = 'DISPONIVEL',
  VENDIDO = 'VENDIDO',
  ALUGADO = 'ALUGADO',
}

export interface createPropertyRequestDTO {
  title: string;
  description: string;
  price: number;
  address: string;
  area: number;
  status: PropertyStatus;
  userId: number;
  images?: string[];
}
