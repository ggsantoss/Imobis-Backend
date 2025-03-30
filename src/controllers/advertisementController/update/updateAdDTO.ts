export interface updateAdRequestDTO {
  title?: string;
  description?: string;
  tipoAnuncio?: 'ALUGUEL' | 'COMPRA';
  imovelId?: number;
  userId?: number;
  price?: number;
}
