import nodemailer from 'nodemailer';
import { envConfig } from '../config/envConfig';
import jwt from 'jsonwebtoken';

export class EmailService {
  static async sendPasswordRecoveryEmail(email: string) {
    const payload = { email };
    const token = jwt.sign(payload, envConfig.SMTP_SECRET, { expiresIn: '1h' });

    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASS,
      },
    });

    await transport.sendMail({
      from: 'Imobis <guibio244@gmail.com>',
      to: email,
      subject: 'Password Recovery - Imobis',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hello!</h2>
          <p>We received a request to reset your password.</p>
          <p>To proceed, click the button below:</p>
          <p>
            <a href="http://localhost:3000/auth/verifySmtpToken/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <br>
          <p>Best regards,<br><strong>The Imobis Team</strong></p>
        </div>
      `,
      text: `We received a request to reset your password. Use the following link to proceed: http://localhost:3000/auth/verifySmtpToken/${token} (expires in 1 hour). If you did not request this, please ignore this email.`,
    });
  }

  static async sendTokenInvite(email: string) {
    const payload = { email };
    const token = jwt.sign(payload, envConfig.INVITE_SECRET, {
      expiresIn: '1h',
    });

    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASS,
      },
    });

    await transport.sendMail({
      from: 'Imobis <guibio244@gmail.com>',
      to: email,
      subject: 'You’ve Been Invited to Join Imobis!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>You're Invited!</h2>
          <p>You've been invited to join our organization on the <strong>Imobis</strong> platform.</p>
          <p>Use the code below to accept your invitation:</p>
          <p style="font-size: 18px; font-weight: bold; color: #333;">${token}</p>
          <p>This code will expire in 1 hour.</p>
          <br>
          <p>We're excited to have you with us!</p>
          <p>Sincerely,<br><strong>The Imobis Team</strong></p>
        </div>
      `,
      text: `You've been invited to join Imobis! Use the following token to accept the invitation: ${token} (expires in 1 hour). We're excited to have you with us!`,
    });

    return token;
  }
}
