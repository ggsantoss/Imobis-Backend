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
import { OrganizationRepository } from '../../repository/organizationRepository';

export class BuyAdController {
  static async buy(req: FastifyRequest, reply: FastifyReply) {
    const schema = Joi.object({
      quantity: Joi.number().required(),
      adId: Joi.number().required(),
      organizationId: Joi.number().optional(),
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

    let decodedToken: { userId: number };
    try {
      decodedToken = jwt.verify(token, envConfig.JWT_SECRET) as {
        userId: number;
      };
    } catch (e) {
      console.log(e);
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const { quantity, adId, organizationId }: BuyAdRequestDTO = value;

    const ad = await AdRepository.findById(adId);
    if (!ad) {
      return reply.status(404).send({ error: 'Ad not found' });
    }

    if (ad.organizationId && !organizationId) {
      return reply.status(400).send({
        error:
          'This ad belongs to an organization. organizationId is required.',
      });
    }

    if (organizationId) {
      const organization =
        await OrganizationRepository.findById(organizationId);
      if (!organization) {
        return reply
          .status(404)
          .send({ error: 'This organization does not exist' });
      }

      const userInOrg = await OrganizationRepository.isUserInOrganization(
        decodedToken.userId,
        organizationId,
      );
      if (!userInOrg) {
        return reply
          .status(403)
          .send({ error: 'You are not part of this organization' });
      }

      if (ad.organizationId !== organizationId) {
        return reply
          .status(403)
          .send({ error: 'Ad does not belong to this organization' });
      }
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
    if (!/^ORD-\d+-USR-\d+-\d+$/.test(externalReference)) {
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
        notification_url: `https://1f0f-45-184-233-148.ngrok-free.app/payments/notification`,
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
      ...(organizationId && {
        organization: { connect: { id: organizationId } },
      }),
    });

    return reply.status(201).send({ status: 'success', initPoint });
  }
}
