import { FastifyReply, FastifyRequest } from 'fastify';
import { EmailService } from '../../../service/sendEmailService';
import { UserRepository } from '../../../repository/userRepository';
import { auditLogMiddleware } from '../../../middleware/auditLog';
import { setAuditData } from '../../../helpers/auditHelper';

export class ForgotPasswordController {
  static async forgotPassword(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = req.body as { email: string };

      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      await EmailService.sendPasswordRecoveryEmail(email);

      setAuditData(req, user.id, 'FORGOT', true, {
        email: email,
        userId: user.id,
      });

      await auditLogMiddleware(req, reply);

      return reply
        .status(200)
        .send({ message: 'Password recovery email sent' });
    } catch (error) {
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
