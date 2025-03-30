export interface createAdDTO {
  imovelId: number;
  userId: number;
  title: string;
  visibility: string;
  description: string;
  tipoAnuncio: 'ALUGUEL' | 'COMPRA';
  price?: number;
}
