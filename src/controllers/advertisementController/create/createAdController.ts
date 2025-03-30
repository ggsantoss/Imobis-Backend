import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import Joi from 'joi';
import { createAdDTO } from './createAdDTO';
import { UserRepository } from '../../../repository/userRepository';
import { PropertyRepository } from '../../../repository/propertyRepository';
import { AdVisibility } from '@prisma/client';

export class CreateAdController {
  static async createAd(req: FastifyRequest, reply: FastifyReply) {
    const adSchema = Joi.object({
      imovelId: Joi.number().integer().min(1).required(),
      userId: Joi.number().integer().min(1).required(),
      title: Joi.string().min(3).required(),
      visibility: Joi.string().valid(...Object.values(AdVisibility)),
      description: Joi.string().min(10).required(),
      tipoAnuncio: Joi.string().valid('ALUGUEL', 'COMPRA').required(),
      price: Joi.number().optional(),
    });

    try {
      const { error, value } = adSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: createAdDTO = value;

      const imovelExists = await PropertyRepository.findById(data.imovelId);
      if (!imovelExists) {
        return reply.status(400).send({ error: 'Imóvel não encontrado' });
      }

      const userExists = await UserRepository.findById(data.userId);
      if (!userExists) {
        return reply.status(400).send({ error: 'Usuário não encontrado' });
      }

      const visibility = data.visibility as AdVisibility;

      const newAd = await AnuncioRepository.create({
        imovel: { connect: { id: data.imovelId } },
        user: { connect: { id: data.userId } },
        title: data.title,
        visibility,
        description: data.description,
        tipoAnuncio: data.tipoAnuncio,
        price: data.price,
      });

      reply.status(201).send(newAd);
    } catch (err) {
      reply.status(500).send({ error: 'Something went wrong' });
    }
  }
}
