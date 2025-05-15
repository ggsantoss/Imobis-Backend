export interface registerUserRequestDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  cpf: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
