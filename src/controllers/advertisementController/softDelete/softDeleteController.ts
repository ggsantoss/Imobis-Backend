import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';
import { AdRepository } from '../../../repository/advertisementRepository';
import { AdVisibility } from '@prisma/client';
import { setAuditData } from '../../../helpers/auditHelper';
import { auditLogMiddleware } from '../../../middleware/auditLog';

interface SoftDeleteRoute extends RouteGenericInterface {
  Params: {
    id: string;
  };
}

export class SoftDeleteController {
  static async softDeleteAd(
    req: FastifyRequest<SoftDeleteRoute>,
    reply: FastifyReply,
  ) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid ID' });
    }

    try {
      const ad = await AdRepository.findById(id);
      if (!ad) {
        return reply.status(404).send({ error: 'Ad not found' });
      }

      const updatedAd = await AdRepository.changeVisibility(
        id,
        AdVisibility.INVISIBLE,
      );

      setAuditData(req, ad.id, 'SOFT_DELETE_AD', true, {
        advertisementId: ad.id,
      });

      await auditLogMiddleware(req, reply);

      return reply.status(200).send({
        message: 'Ad successfully removed',
        ad: updatedAd,
      });
    } catch (error) {
      console.error('Error while attempting to remove the ad:', error);
      return reply.status(500).send({
        error: error || 'An error occurred while trying to remove the ad',
      });
    }
  }
}
