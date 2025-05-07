import { FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

import { BuyAdRequestDTO } from './buyAdDTO';
import { preference } from '../../service/mercadopagoService';
import { envConfig } from '../../config/envConfig';
import { AdRepository } from '../../repository/advertisementRepository';
import { UserRepository } from '../../repository/userRepository';
import { UserAddressRepository } from '../../repository/userAddressRepository';
import { PaymentRepository } from '../../repository/paymentRepository';

export class BuyAdController {
  static async buy(req: FastifyRequest, reply: FastifyReply) {
    const schema = Joi.object({
      quantity: Joi.number().required(),
      adId: Joi.number().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return reply.status(400).send({ error: error.details[0].message });
    }

    const header = req.headers.authorization;
    const token = header?.split(' ')[1];

    if (!token) {
      return reply.status(401).send({ error: 'Token not provided' });
    }

    const decodedToken = jwt.verify(token, envConfig.JWT_SECRET) as {
      userId: number;
    };

    const { quantity, adId }: BuyAdRequestDTO = value;

    const ad = await AdRepository.findById(adId);
    if (!ad) {
      return reply.status(404).send({ error: 'Ad not found' });
    }

    if (decodedToken.userId !== ad.userId) {
      return reply
        .status(403)
        .send({ error: 'You cannot pay for an ad that is not yours' });
    }

    const user = await UserRepository.findById(ad.userId);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const address = await UserAddressRepository.getUserAddress(user.addressId);
    if (!address) {
      return reply.status(404).send({ error: 'User address not found' });
    }

    const externalReference = `ORD-${ad.id}-USR-${user.id}-${Date.now()}`;
    const pattern = /^ORD-\d+-USR-\d+-\d+$/;
    if (!pattern.test(externalReference)) {
      return reply
        .status(400)
        .send({ error: 'Invalid format for external_reference' });
    }

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const preferenceData = {
      body: {
        auto_return: 'approved',
        back_urls: {
          success: `${envConfig.FRONTEND_URL}/success`,
          failure: `${envConfig.FRONTEND_URL}/failure`,
          pending: `${envConfig.FRONTEND_URL}/pending`,
        },
        binary_mode: false,
        external_reference: externalReference,
        items: [
          {
            id: '1',
            title: 'Advertisement',
            quantity,
            unit_price: 10,
            description: 'Description of my product',
            category_id: 'retail',
          },
        ],
        payer: {
          email: user.email,
          name: user.name,
          phone: { number: user.phone ?? undefined },
          identification: {
            type: 'CPF',
            number: user.cpf,
          },
          address: {
            street_name: address.street,
            zip_code: address.zipCode,
          },
        },
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 4,
          default_payment_method_id: 'account_money',
        },
        notification_url: `https://e3d6-45-184-233-57.ngrok-free.app/payments/notification`,
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: oneHourLater.toISOString(),
        metadata: {
          adId,
          quantity,
        },
      },
    };

    const response = await preference.create(preferenceData);
    const initPoint = response.init_point;

    await PaymentRepository.create({
      amount: 10,
      status: 'PENDING',
      externalRef: externalReference,
      user: { connect: { id: user.id } },
      ad: { connect: { id: ad.id } },
      property: { connect: { id: ad.propertyId } },
    });

    return reply.status(201).send({ status: 'success', initPoint });
  }
}
