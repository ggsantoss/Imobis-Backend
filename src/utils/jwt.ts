import jwt from 'jsonwebtoken';
import { envConfig } from '../config/envConfig';

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export class JwtUtils {
  public static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public static verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  public static verifyRecoveryToken(token: string): any {
    try {
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        console.log('[JWT VERIFY] Malformed token detected');
        return null;
      }

      return jwt.verify(token, envConfig.SMTP_SECRET);
    } catch (err) {
      console.log('[JWT VERIFY ERROR]', err);
      return null;
    }
  }
}
