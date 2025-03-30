import jwt from 'jsonwebtoken';
import { envConfig } from '../config/envConfig';

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';

export class JwtUtils {
  public static generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public static verifyToken(token: string): object | string {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  public static verifyRecoveryToken(token: string): any {
    try {
      return jwt.verify(token, envConfig.SMTP_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}
