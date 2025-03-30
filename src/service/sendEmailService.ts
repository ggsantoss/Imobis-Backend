import nodemailer from 'nodemailer';
import { envConfig } from '../config/envConfig';

import jwt from 'jsonwebtoken';

export class EmailService {
  static async sendPasswordRecoveryEmail(email: string) {
    const payload = {
      email: email,
    };

    const token = jwt.sign(payload, envConfig.SMTP_SECRET, { expiresIn: '1h' });

    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'guibio244@gmail.com',
        pass: 'yklo lpbv xivb mouw',
      },
    });

    transport.sendMail({
      from: 'SrCrow02 <guibio81194@gmail.com>',
      to: email,
      subject: 'Recuperação de Senha',
      html: `<h1>Seu token de recuperação de senha é: http://localhost:3000/auth/verifySmtpToken/${token}</h1>`,
      text: `Seu token de recuperação de senha é: http://localhost:3000/auth/verifySmtpToken/${token}`,
    });
  }
}
