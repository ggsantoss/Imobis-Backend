import { FastifyReply, FastifyRequest } from 'fastify';
import { AdRepository } from '../../../repository/advertisementRepository';

export class AddViewController {
  public static async add(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const advertisementId = parseInt(id, 10);

      if (isNaN(advertisementId)) {
        return;
      }

      const view = await AdRepository.addView(advertisementId);

      return reply.status(200).send(view);
    } catch (err) {
      reply.status(500).send({
        error: 'Something went wrong',
        details: (err as Error).message,
      });
    }
  }
}
