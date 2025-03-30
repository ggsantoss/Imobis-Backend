import MercadoPagoConfig, { Preference } from 'mercadopago';
import { envConfig } from '../config/envConfig';

const client = new MercadoPagoConfig({
  accessToken: envConfig.MP_ACCESS_TOKEN,
});

export const preference = new Preference(client);
