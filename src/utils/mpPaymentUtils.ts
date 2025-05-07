import { envConfig } from '../config/envConfig';

export const fetchPaymentDetails = async (id: string) => {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${id}`,
    {
      headers: { Authorization: `Bearer ${envConfig.MP_ACCESS_TOKEN}` },
    },
  );
  return await response.json();
};

export const fetchMerchantOrder = async (id: string) => {
  const response = await fetch(
    `https://api.mercadopago.com/merchant_orders/${id}`,
    {
      headers: { Authorization: `Bearer ${envConfig.MP_ACCESS_TOKEN}` },
    },
  );
  return await response.json();
};
