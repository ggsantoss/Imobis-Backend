import { FastifyReply, FastifyRequest } from 'fastify';
import { AnuncioRepository } from '../../../repository/advertisementRepository';
import Joi from 'joi';
import { updateAdRequestDTO } from './updateAdDTO';

export class UpdateAdController {
  static async updateAd(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const advertisementId = parseInt(id, 10);

      if (isNaN(advertisementId)) {
        return reply.status(400).send({ error: 'Invalid advertisement ID' });
      }

      const anuncioSchema = Joi.object({
        title: Joi.string().min(3).optional(),
        description: Joi.string().min(5).optional(),
        tipoAnuncio: Joi.string().valid('ALUGUEL', 'COMPRA').optional(),
        imovelId: Joi.number().optional(),
        userId: Joi.number().optional(),
        price: Joi.number().optional(),
      });

      const { error, value } = anuncioSchema.validate(req.body);

      if (error) {
        return reply.status(400).send({ error: error.details[0].message });
      }

      const data: updateAdRequestDTO = value;

      console.log('Updated data:', data);

      const updatedAd = await AnuncioRepository.update(advertisementId, data);

      if (!updatedAd) {
        return reply.status(404).send({ error: 'Advertisement not found' });
      }

      return reply.status(200).send(updatedAd);
    } catch (err) {
      console.error('Error during updateAd:', err);
      return reply
        .status(500)
        .send({ error: 'Something went wrong', details: err });
    }
  }
}
